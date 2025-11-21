import { randEmail, randText } from "@ngneat/falso";
import { test } from "e2e/fixtures";
import { getRandomAccount } from "tests/utils";

test("create account, first contact and first mail", async ({ page }) => {
  await page.goto("/");

  await page.waitForSelector("text=No mail account configured.");

  await page.click("text=Configure account");

  await page.waitForSelector("text=Add Account");

  const account = getRandomAccount();

  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Password").fill(account.password);
  await page.getByLabel("Host").fill(account.host);
  await page.getByLabel("Port").fill(account.port.toString());

  await page.click("role=button[name=Submit]");

  await page.waitForSelector(`text=${account.email}`);

  await page.click(`text=${account.email}`);
  await page.click("text=Contacts");

  const contactEmail = randEmail();
  await page.getByLabel("Email").fill(contactEmail);
  await page.click("role=button[name='Add Contact']");

  await page.waitForSelector(`text=${contactEmail}`);

  await page.click("text=Mails");
  await page.click("text=Add Mail");

  const subject = randText();
  const body = randText();

  await page.getByLabel("Subject").fill(subject);
  await page.getByLabel("Body").fill(body);

  await page.click("role=button[name=Submit]");

  await page.waitForSelector(`text=${subject}`);
  await page.waitForSelector(`text=${body}`);
});
