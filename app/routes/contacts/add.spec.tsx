import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { expect, test } from "vitest";
import AddContacts, { loader, action } from "./add";
import Home from "../home";
import prisma from "~/db.server";

test("failed validation", async () => {
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: AddContacts,
      loader,
      HydrateFallback: () => <div>Loading...</div>,
    },
  ]);

  render(<Stub />);

  const submit = await waitFor(() =>
    screen.getByRole("button", { name: "Submit" }),
  );
  await act(async () => submit.click());

  await waitFor(() => screen.getByText("Invalid email address"));
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
      path: "/contacts/add",
      Component: AddContacts,
      loader,
      action,
      HydrateFallback: () => <div>Loading...</div>,
    },
  ]);

  render(<Stub initialEntries={["/contacts/add"]} />);

  const email = await waitFor(() => screen.getByLabelText("Email"));
  await act(async () => {
    fireEvent.input(email, { target: { value: "contact@example.com" } });
  });
  const submit = await waitFor(() =>
    screen.getByRole("button", { name: "Submit" }),
  );
  await act(async () => submit.click());

  await waitFor(async () => {
    const contact = await prisma.contact.findUnique({
      where: { email: "contact@example.com" },
    });

    expect(contact).not.toBeNull();
  });
});
