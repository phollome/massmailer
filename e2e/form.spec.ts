import { invariant } from "@epic-web/invariant";
import { expect } from "@playwright/test";
import { test } from "e2e/fixtures";
import { getRandomAccount, getRandomContact, getRandomMail } from "tests/utils";
import prisma from "~/db.server";

test("update mail", async ({ page }) => {
  const accountData = getRandomAccount();
  const account = await prisma.account.create({
    data: accountData,
  });

  const contacts = await prisma.contact.createManyAndReturn({
    data: [
      { ...getRandomContact(), accountId: account.id },
      { ...getRandomContact(), accountId: account.id },
      { ...getRandomContact(), accountId: account.id },
    ],
  });

  const mail = await prisma.mail.create({
    data: {
      ...getRandomMail(),
      accountId: account.id,
    },
  });
  await page.goto(`/mail/${mail.id}`);

  const updateButton = page.getByText("Update", { exact: true });

  await expect(updateButton).toBeDisabled();

  // change subject
  await page.getByLabel("Subject").fill("Updated Subject");
  await expect(updateButton).toBeEnabled();
  await updateButton.click();
  await expect(updateButton).toBeDisabled();

  // change body
  await page.getByLabel("Body").fill("Updated Body");
  await expect(updateButton).toBeEnabled();
  await updateButton.click();
  await expect(updateButton).toBeDisabled();

  // change recipients - add one
  await page.getByLabel(contacts[0].email).check();
  await expect(updateButton).toBeEnabled();
  await updateButton.click();
  await expect(updateButton).toBeDisabled();

  // change recipients - add remaining
  await page.getByLabel(contacts[1].email).check();
  await page.getByLabel(contacts[2].email).check();
  await expect(updateButton).toBeEnabled();
  await updateButton.click();
  await expect(updateButton).toBeDisabled();

  // check database
  const mailResult = await prisma.mail.findUnique({
    where: { id: mail.id },
    include: { recipients: true },
  });

  expect(mailResult).not.toBeNull();
  invariant(mailResult !== null, "Mail should exist");
  expect(mailResult.subject).toBe("Updated Subject");
  expect(mailResult.body).toBe("Updated Body");
  expect(mailResult.recipients.length).toBe(3);
});
