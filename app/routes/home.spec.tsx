import { render, screen, waitFor } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { getRandomAccount } from "tests/utils";
import { test } from "vitest";
import prisma from "~/db.server";
import Home, { loader } from "./home";

test("no account configured", async () => {
  const HomeStub = createRoutesStub([
    {
      path: "/",
      Component: Home,
      loader,
      HydrateFallback: () => <div>Loading...</div>,
    },
  ]);

  render(<HomeStub />);

  await waitFor(() => screen.getByText("No mail account configured."));
  await waitFor(() => screen.getByRole("link", { name: "Configure account" }));
});

test("accounts configured", async () => {
  const account1 = getRandomAccount();
  const account2 = getRandomAccount();
  await prisma.account.createMany({
    data: [account1, account2],
  });

  const HomeStub = createRoutesStub([
    {
      path: "/",
      Component: Home,
      loader,
      HydrateFallback: () => <div>Loading...</div>,
    },
  ]);

  render(<HomeStub />);

  await waitFor(() => screen.getByText(account1.email));
  await waitFor(() => screen.getByText(account2.email));
});
