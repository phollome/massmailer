import prisma from "~/db.server";
import nodemailer from "nodemailer";

const Interval = 1_500;
const MaxConnectionsPerAccount = 5;
const MaxMessagesPerConnection = 100;

let loop: NodeJS.Timeout;

export function startMailer(
  // For testing purposes
  options: { nodemailer: typeof nodemailer; interval: number } = {
    nodemailer: nodemailer,
    interval: Interval,
  },
) {
  const mailers: Record<
    string,
    {
      transporter: nodemailer.Transporter;
      config: {
        host: string;
        port: number;
        email: string;
        password: string;
      };
    }
  > = {};

  loop = setInterval(async () => {
    console.log("Look up for mails to process...");

    const mails = await prisma.mail.findMany({
      where: {
        process: true,
        complete: false,
        accountId: { not: null }, // TODO: Investigate why TypeScript ignores this
      },
      include: {
        recipients: {
          select: {
            contact: {
              select: {
                id: true,
                email: true,
              },
            },
            sent: true,
          },
        },
      },
    });

    // Collect accounts
    const accountIds = Array.from(
      new Set(
        mails.map((mail) => {
          return mail.accountId;
        }),
      ),
    );

    for (const accountId of accountIds) {
      // Should not happen due to query
      if (accountId === null) {
        continue;
      }

      let transporter: nodemailer.Transporter;

      // Check configuration of existing mailer
      if (typeof mailers[accountId] !== "undefined") {
        const account = await prisma.account.findUnique({
          where: { id: accountId! },
        });

        if (account === null) {
          console.error(`Account not found for id: ${accountId}`);
          continue;
        }

        const existingConfig = mailers[accountId].config;

        // Remove existing mailer if configuration changed
        // Will be recreated next iteration
        if (
          existingConfig.host !== account.host ||
          existingConfig.port !== account.port ||
          existingConfig.email !== account.email ||
          existingConfig.password !== account.password
        ) {
          mailers[accountId].transporter.close();
          delete mailers[accountId];
        }
      } else {
        const account = await prisma.account.findUnique({
          where: { id: accountId! },
        });

        if (account === null) {
          console.error(`Account not found for id: ${accountId}`);
          continue;
        }

        transporter = options.nodemailer.createTransport({
          host: account.host,
          port: account.port,
          pool: true,
          maxConnections: MaxConnectionsPerAccount,
          maxMessages: MaxMessagesPerConnection,
          auth: {
            user: account.email,
            pass: account.password,
          },
        });

        // Verify connection
        try {
          await transporter.verify();
        } catch (error) {
          console.error(
            `Failed to verify transporter for account id: ${accountId}`,
            error,
          );
          continue;
        }

        mailers[accountId] = {
          transporter,
          config: {
            host: account.host,
            port: account.port,
            email: account.email,
            password: account.password,
          },
        };
      }
    }

    // Collect mails to send
    const bulkOperations: Array<{
      transporter: nodemailer.Transporter;
      mailId: string;
      contactId: string;
      from: string;
      to: string;
      subject: string;
      text: string;
    }> = [];

    for (const mail of mails) {
      // Should not happen due to query
      if (mail.accountId === null) {
        continue;
      }

      // Check if all mails sent
      const unsentRecipients = mail.recipients.filter((recipient) => {
        return recipient.sent === false;
      });
      if (unsentRecipients.length === 0) {
        // Mark mail as complete
        await prisma.mail.update({
          where: { id: mail.id },
          data: {
            complete: true,
          },
        });
        continue;
      }

      const transporter = mailers[mail.accountId].transporter;
      mail.recipients.forEach((recipient) => {
        // Skip already sent
        if (recipient.sent) {
          return;
        }
        // Should not happen due to query
        if (mail.accountId === null) {
          return;
        }
        bulkOperations.push({
          transporter,
          mailId: mail.id,
          contactId: recipient.contact.id,
          from: mailers[mail.accountId].config.email,
          to: recipient.contact.email,
          subject: mail.subject,
          text: mail.body,
        });
      });
    }

    // Send mails
    for (const operation of bulkOperations) {
      console.log(
        `Sending mail id: ${operation.mailId} to contact id: ${operation.contactId}`,
      );

      try {
        await operation.transporter.sendMail({
          from: operation.from,
          to: operation.to,
          subject: operation.subject,
          text: operation.text,
        });

        // Mark recipient as sent
        await prisma.recipientOfMail.updateMany({
          where: {
            mailId: operation.mailId,
            contactId: operation.contactId,
          },
          data: {
            sent: true,
          },
        });
      } catch (error) {
        // Mark recipient as failed
        await prisma.recipientOfMail.updateMany({
          where: {
            mailId: operation.mailId,
            contactId: operation.contactId,
          },
          data: {
            failed: true,
          },
        });
        console.error(
          `Failed to send mail id: ${operation.mailId} to contact id: ${operation.contactId}`,
          error,
        );
      }
    }
  }, options.interval);
}

export function stopMailer() {
  clearInterval(loop);
}
