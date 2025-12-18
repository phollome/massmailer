import { getRandomAccount, getRandomContact, getRandomMail } from "tests/utils";
import { expect, test, vi } from "vitest";
import prisma from "~/db.server";
import { startMailer } from "./mailer";

test("process mail", async () => {
  const account = await prisma.account.create({
    data: getRandomAccount(),
  });

  const mail = await prisma.mail.create({
    data: {
      ...getRandomMail(),
      accountId: account.id,
    },
  });

  const contact = await prisma.contact.create({
    data: {
      ...getRandomContact(),
      accountId: account.id,
    },
  });

  await prisma.recipientOfMail.create({
    data: {
      mailId: mail.id,
      contactId: contact.id,
    },
  });

  await prisma.mail.update({
    where: { id: mail.id },
    data: {
      process: true,
    },
  });

  // Mock mailer
  vi.mock(import("nodemailer"), async (importOriginal) => {
    const original = await importOriginal();
    return {
      ...original,
      createTransport: vi.fn().mockReturnValue({
        verify: vi.fn(),
        sendMail: vi.fn().mock,
      }),
    };
  });

  const sendMail = vi.fn().mockResolvedValue({});

  const nodemailerMock = {
    createTransport: vi.fn().mockReturnValue({
      verify: vi.fn(),
      sendMail,
    }),
  };

  startMailer({
    nodemailer: nodemailerMock as unknown as typeof import("nodemailer"),
    interval: 5,
  });

  await vi.waitFor(
    async () => {
      const updatedMail = await prisma.mail.findUnique({
        where: { id: mail.id },
      });

      if (updatedMail === null) {
        throw new Error("Mail not found");
      }

      if (updatedMail.complete === false) {
        throw new Error("Mail not yet processed");
      }
    },
    { timeout: 5_000 },
  );

  const unprocessedMails = await prisma.mail.findMany({
    where: {
      id: mail.id,
      complete: false,
    },
  });

  expect(sendMail).toHaveBeenCalledExactlyOnceWith({
    from: account.email,
    to: contact.email,
    subject: mail.subject,
    text: mail.body,
  });
  expect(unprocessedMails.length).toBe(0);

  // Cleanup
  vi.clearAllTimers();
});
