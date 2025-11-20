import { randEmail, randNumber, randUuid } from "@ngneat/falso";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { expect, test } from "vitest";
import prisma from "~/db.server";
import AddContact, { action, loader } from "./add";
import { getRandomAccount } from "tests/utils";

test("failed validation", async () => {
  const Stub = createRoutesStub([
    {
      path: "/:accountId/contacts/add",
      Component: AddContact,
      loader,
      HydrateFallback: () => {
        return <div>Loading...</div>;
      },
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
  const account = await prisma.account.create({
    data: getRandomAccount(),
  });

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

  render(<Stub initialEntries={[`/${account.id}/contacts/add`]} />);

  const email = randEmail();
  const emailInput = await waitFor(() => screen.getByLabelText("Email"));
  await act(async () => {
    fireEvent.input(emailInput, { target: { value: email } });
  });
  const submit = await waitFor(() =>
    screen.getByRole("button", { name: "Submit" }),
  );
  await act(async () => submit.click());

  await waitFor(async () => {
    const contact = await prisma.contact.findFirst({
      where: { email: email },
    });

    expect(contact).not.toBeNull();
  });
});
