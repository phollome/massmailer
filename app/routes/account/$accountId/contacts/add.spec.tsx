import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { afterEach, beforeEach, expect, test } from "vitest";
import AddContact, { loader, action } from "./add";
import Home from "~/routes/home";
import prisma from "~/db.server";

beforeEach(async () => {
  await prisma.account.create({
    data: {
      id: "1",
      email: "account@example.com",
      password: "password",
      host: "smtp.example.com",
      port: 587,
    },
  });
});

afterEach(async () => {
  await prisma.account.deleteMany();
});

test("failed validation", async () => {
  const Stub = createRoutesStub([
    {
      path: "/:accountId/contacts/add",
      Component: AddContact,
      loader,
      HydrateFallback: () => <div>Loading...</div>,
    },
  ]);

  render(<Stub initialEntries={["/1/contacts/add"]} />);

  const submit = await waitFor(() =>
    screen.getByRole("button", { name: "Submit" }),
  );
  await act(async () => submit.click());

  await waitFor(() => screen.getByText("Invalid email address"));
});

test("successful submission", async () => {
  const Stub = createRoutesStub([
    {
      path: "/:accountId/contacts/add",
      Component: AddContact,
      loader,
      action,
      HydrateFallback: () => {
        return <div>Loading...</div>;
      },
    },
  ]);

  render(<Stub initialEntries={["/1/contacts/add"]} />);

  const email = await waitFor(() => screen.getByLabelText("Email"));
  await act(async () => {
    fireEvent.input(email, { target: { value: "contact@example.com" } });
  });
  const submit = await waitFor(() =>
    screen.getByRole("button", { name: "Submit" }),
  );
  await act(async () => submit.click());

  await waitFor(async () => {
    const contact = await prisma.contact.findFirst({
      where: { email: "contact@example.com" },
    });

    expect(contact).not.toBeNull();
  });
});
