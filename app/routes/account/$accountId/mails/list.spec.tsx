import { getRandomAccount } from "tests/utils";
import { test } from "vitest";
import prisma from "~/db.server";
import MailList, { loader } from "./list";
import { createRoutesStub } from "react-router";
import { render, screen, waitFor } from "@testing-library/react";
import { randText } from "@ngneat/falso";

test("no mails found", async () => {
  const account = await prisma.account.create({
    data: getRandomAccount(),
  });

  const Stub = createRoutesStub([
    {
      path: `/account/:accountId/mails`,
      loader,
      Component: MailList,
      HydrateFallback: () => {
        return <div>Loading...</div>;
      },
    },
  ]);
  render(<Stub initialEntries={[`/account/${account.id}/mails`]} />);

  await waitFor(() => screen.getByText("No mails found."));
});

test("mails found", async () => {
  const account = await prisma.account.create({
    data: getRandomAccount(),
  });

  const mail1 = await prisma.mail.create({
    data: {
      subject: randText(),
      body: randText(),
      accountId: account.id,
    },
  });
  const mail2 = await prisma.mail.create({
    data: {
      subject: randText(),
      body: randText(),
      accountId: account.id,
    },
  });

  const Stub = createRoutesStub([
    {
      path: "/account/:accountId/mails/",
      Component: MailList,
      loader,
      HydrateFallback: () => {
        return <div>Loading...</div>;
      },
    },
  ]);

  render(<Stub initialEntries={[`/account/${account.id}/mails`]} />);

  await waitFor(() => screen.getByText(mail1.subject));
  await waitFor(() => screen.getByText(mail2.subject));
});
