import { randEmail, randText } from "@ngneat/falso";
import { test } from "e2e/fixtures";
import { getRandomAccount } from "tests/utils";
import prisma from "~/db.server";

test("create account", async ({ page }) => {
  const accountData = getRandomAccount();

  await page.goto("/");

  await page.waitForSelector("text=Select Account");

  await page.click("text=Add Account");

  await page.getByLabel("Email").fill(accountData.email);
  await page.getByLabel("Password").fill(accountData.password);
  await page.getByLabel("Host").fill(accountData.host);
  await page.getByLabel("Port").fill(accountData.port.toString());

  await page.click("role=button[name=Submit]");
  await page.waitForLoadState("networkidle");

  const account = await prisma.account.findFirst({
    where: { email: accountData.email },
  });

  if (account === null) {
    throw new Error("Account was not created in the database");
  }
});

test("create contact", async ({ page }) => {
  const accountData = getRandomAccount();
  const account = await prisma.account.create({
    data: {
      email: accountData.email,
      password: accountData.password,
      host: accountData.host,
      port: accountData.port,
    },
  });

  await page.goto(`/account/${account.id}/contacts`);

  const contactEmail = randEmail();
  await page.getByLabel("Email").fill(contactEmail);
  await page.click("role=button[name='Add Contact']");

  await page.waitForLoadState("networkidle");

  const contact = await prisma.contact.findFirst({
    where: { email: contactEmail, account: { id: account.id } },
  });

  if (contact === null) {
    throw new Error("Contact was not created in the database");
  }
});

test("create mail", async ({ page }) => {
  const accountData = getRandomAccount();
  const account = await prisma.account.create({
    data: {
      email: accountData.email,
      password: accountData.password,
      host: accountData.host,
      port: accountData.port,
    },
  });

  await page.goto(`/account/${account.id}/mails`);

  await page.click("role=link[name='Add Mail']");
  const subject = randText();
  const body = randText();

  await page.getByLabel("Subject").fill(subject);
  await page.getByLabel("Body").fill(body);

  await page.click("role=button[name=Submit]");

  await page.waitForLoadState("networkidle");

  const mail = await prisma.mail.findFirst({
    where: { subject, body, account: { id: account.id } },
  });

  if (mail === null) {
    throw new Error("Mail was not created in the database");
  }
});
