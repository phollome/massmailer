import { test, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import Home, { loader } from "./home";
import prisma from "~/db.server";

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
});

test("account configured", async () => {
  await prisma.mailAccount.create({
    data: {
      email: "mail@example.com",
      password: "password",
      host: "smtp.example.com",
      port: 587,
    },
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

  await waitFor(() => screen.getByText("mail@example.com"));
});
