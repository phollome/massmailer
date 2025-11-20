import { createRoutesStub } from "react-router";
import Mail, { loader } from "./$id";
import { test } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ErrorBoundary } from "~/root";
import prisma from "~/db.server";

test("mail not found", async () => {
  const Stub = createRoutesStub([
    {
      path: "/mail/1",
      loader,
      Component: Mail,
      ErrorBoundary: ErrorBoundary,
      HydrateFallback: () => <div>Loading...</div>,
    },
  ]);

  render(<Stub initialEntries={["/mail/1"]} />);

  await waitFor(() => screen.getByText("404"));
  await waitFor(() => screen.getByText("Mail not found"));
});

test("mail found", async () => {
  const Stub = createRoutesStub([
    {
      path: "/mail/:id",
      loader,
      Component: Mail,
      HydrateFallback: () => <div>Loading...</div>,
      ErrorBoundary,
    },
  ]);

  await prisma.mail.create({
    data: {
      id: "1",
      subject: "Test Subject",
      body: "Test Body",
    },
  });

  render(<Stub initialEntries={["/mail/1"]} />);

  await waitFor(() => screen.getByText("Test Subject"));
  await waitFor(() => screen.getByText("Test Body"));
});
