import { randEmail, randUuid } from "@ngneat/falso";
import { render, screen, waitFor } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { getRandomAccount } from "tests/utils";
import { afterEach, test } from "vitest";
import prisma from "~/db.server";
import { ErrorBoundary } from "~/root";
import Account, { loader } from "./$accountId";

afterEach(async () => {
  await prisma.account.deleteMany();
});

test("account not found", async () => {
  const Stub = createRoutesStub([
    {
      path: "/account/1",
      loader,
      Component: Account,
      ErrorBoundary: ErrorBoundary,
      HydrateFallback: () => <div>Loading...</div>,
    },
  ]);
  render(<Stub initialEntries={["/account/1"]} />);

  await waitFor(() => screen.getByText("404"));
  await waitFor(() => screen.getByText("Account not found"));
});

test("account home", async () => {
  const account = await prisma.account.create({
    data: getRandomAccount(),
  });

  const Stub = createRoutesStub([
    {
      path: `/account/:accountId`,
      loader,
      Component: Account,
      ErrorBoundary: ErrorBoundary,
      HydrateFallback: () => {
        return <div>Loading...</div>;
      },
    },
  ]);

  render(<Stub initialEntries={[`/account/${account.id}`]} />);

  await waitFor(() => screen.getByText(account.email));
});
