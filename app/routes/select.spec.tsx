import { render, screen, waitFor } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { getRandomAccount } from "tests/utils";
import { test } from "vitest";
import prisma from "~/db.server";
import Select, { loader } from "./select";

test("no account configured", async () => {
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: Select,
      loader,
      HydrateFallback: () => <div>Loading...</div>,
    },
  ]);

  render(<Stub />);

  await waitFor(() => screen.getByText("No mail account configured."));
  await waitFor(() => screen.getByRole("link", { name: "Add Account" }));
});

test("accounts configured", async () => {
  const account1 = getRandomAccount();
  const account2 = getRandomAccount();
  await prisma.account.createMany({
    data: [account1, account2],
  });

  const Stub = createRoutesStub([
    {
      path: "/",
      Component: Select,
      loader,
      HydrateFallback: () => <div>Loading...</div>,
    },
  ]);

  render(<Stub />);

  await waitFor(() => screen.queryByText("Select account"));
  await waitFor(() => screen.getByText(account1.email));
  await waitFor(() => screen.getByText(account2.email));
});
