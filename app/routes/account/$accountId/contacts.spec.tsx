import { createRoutesStub } from "react-router";
import Contacts, { loader, action } from "./contacts";
import { expect, test } from "vitest";
import { getRandomAccount } from "tests/utils";
import prisma from "~/db.server";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import { randEmail } from "@ngneat/falso";

test("no contacts found", async () => {
  const account = await prisma.account.create({
    data: getRandomAccount(),
  });

  const Stub = createRoutesStub([
    {
      path: "/account/:accountId/contacts/",
      Component: Contacts,
      loader,
      HydrateFallback: () => {
        return <div>Loading...</div>;
      },
    },
  ]);

  render(<Stub initialEntries={[`/account/${account.id}/contacts`]} />);

  await waitFor(() => screen.getByText("No contacts found."));
});

test("contacts found", async () => {
  const account = await prisma.account.create({
    data: getRandomAccount(),
  });

  const contact1 = await prisma.contact.create({
    data: {
      email: randEmail(),
      accountId: account.id,
    },
  });
  const contact2 = await prisma.contact.create({
    data: {
      email: randEmail(),
      accountId: account.id,
    },
  });

  const Stub = createRoutesStub([
    {
      path: "/account/:accountId/contacts/",
      Component: Contacts,
      loader,
      HydrateFallback: () => {
        return <div>Loading...</div>;
      },
    },
  ]);

  render(<Stub initialEntries={[`/account/${account.id}/contacts`]} />);

  await waitFor(() => screen.getByText(contact1.email));
  await waitFor(() => screen.getByText(contact2.email));
});

test("add contact failed validation", async () => {
  const Stub = createRoutesStub([
    {
      path: "/:accountId/contacts/add",
      Component: Contacts,
      loader,
      HydrateFallback: () => {
        return <div>Loading...</div>;
      },
    },
  ]);

  render(<Stub initialEntries={["/1/contacts/add"]} />);

  const submit = await waitFor(() =>
    screen.getByRole("button", { name: "Add Contact" }),
  );
  await act(async () => submit.click());

  await waitFor(() => screen.getByText("Invalid email address"));
});

test("successful submission", async () => {
  const account = await prisma.account.create({
    data: getRandomAccount(),
  });

  const Stub = createRoutesStub([
    {
      path: "/:accountId/contacts",
      Component: Contacts,
      loader,
      action,
      HydrateFallback: () => {
        return <div>Loading...</div>;
      },
    },
  ]);

  render(<Stub initialEntries={[`/${account.id}/contacts`]} />);

  const email = randEmail();
  const emailInput = await waitFor(() => screen.getByLabelText("Email"));
  await act(async () => {
    fireEvent.input(emailInput, { target: { value: email } });
  });
  const submit = await waitFor(() =>
    screen.getByRole("button", { name: "Add Contact" }),
  );
  await act(async () => submit.click());

  await waitFor(async () => {
    const contact = await prisma.contact.findFirst({
      where: { email: email },
    });

    expect(contact).not.toBeNull();
  });
});
