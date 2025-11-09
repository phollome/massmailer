import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { expect, test } from "vitest";
import AddMail, { loader, action } from "./add";
import Home from "../home";
import prisma from "~/db.server";

test("failed validation", async () => {
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: AddMail,
      loader,
      HydrateFallback: () => <div>Loading...</div>,
    },
  ]);

  render(<Stub />);

  const submit = await waitFor(() =>
    screen.getByRole("button", { name: "Submit" }),
  );
  await act(async () => submit.click());

  await waitFor(() => screen.getByText("Subject is required"));
  await waitFor(() => screen.getByText("Body is required"));
});

test("successful submission", async () => {
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: Home,
      loader: () => null,
      HydrateFallback: () => <div>Loading...</div>,
    },
    {
      path: "/mails/add",
      Component: AddMail,
      loader,
      action,
      HydrateFallback: () => <div>Loading...</div>,
    },
  ]);

  render(<Stub initialEntries={["/mails/add"]} />);

  const subject = await waitFor(() => screen.getByLabelText("Subject"));
  const body = await waitFor(() => screen.getByLabelText("Body"));
  await act(async () => {
    fireEvent.input(subject, { target: { value: "Test Email" } });
    fireEvent.input(body, {
      target: { value: "Hello, this is a test email." },
    });
  });
  const submit = await waitFor(() =>
    screen.getByRole("button", { name: "Submit" }),
  );
  await act(async () => submit.click());

  await waitFor(async () => {
    const mail = await prisma.mail.findFirst({
      where: { subject: "Test Email", body: "Hello, this is a test email." },
    });

    expect(mail).not.toBeNull();
  });
});
