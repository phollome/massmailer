import { createRoutesStub } from "react-router";
import Account, { loader } from "./$accountId";
import { ErrorBoundary } from "~/root";
import { afterEach, beforeEach, test } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import prisma from "~/db.server";

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
  await prisma.account.create({
    data: {
      id: "1",
      email: "test@example.com",
      password: "password",
      host: "smtp.example.com",
      port: 587,
    },
  });

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

  await waitFor(() => screen.getByText("test@example.com"));
});
