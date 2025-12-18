import { createRoutesStub } from "react-router";
import { default as Component, loader, action } from "./$id";
import { expect, test } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ErrorBoundary } from "~/root";
import prisma from "~/db.server";
import { getRandomAccount, getRandomContact, getRandomMail } from "tests/utils";
import { act } from "react";
import type { Account, Contact, Mail } from "@prisma/client";

test("mail not found", async () => {
  const Stub = createRoutesStub([
    {
      path: "/mail/1",
      loader,
      Component,
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
      Component,
      HydrateFallback: () => <div>Loading...</div>,
      ErrorBoundary,
    },
  ]);

  const mail = await prisma.mail.create({
    data: getRandomMail(),
  });

  render(<Stub initialEntries={[`/mail/${mail.id}`]} />);
  const subject = (await waitFor(() =>
    screen.getByLabelText("Subject"),
  )) as HTMLInputElement;
  const body = (await waitFor(() =>
    screen.getByLabelText("Body"),
  )) as HTMLInputElement;

  await waitFor(() => expect(subject.value).toBe(mail.subject));
  await waitFor(() => expect(body.value).toBe(mail.body));
});

test("edit mail", async () => {
  const Stub = createRoutesStub([
    {
      path: "/mail/:id",
      loader,
      action,
      Component,
      HydrateFallback: () => <div>Loading...</div>,
      ErrorBoundary,
    },
  ]);

  const mail = await prisma.mail.create({
    data: getRandomMail(),
  });

  render(<Stub initialEntries={[`/mail/${mail.id}`]} />);

  const dataToUpdate = getRandomMail();

  const subject = (await waitFor(() =>
    screen.getByLabelText("Subject"),
  )) as HTMLInputElement;
  const body = (await waitFor(() =>
    screen.getByLabelText("Body"),
  )) as HTMLInputElement;

  await waitFor(() => expect(subject.value).toBe(mail.subject));
  await waitFor(() => expect(body.value).toBe(mail.body));

  await act(async () => {
    fireEvent.input(subject, { target: { value: dataToUpdate.subject } });
    fireEvent.input(body, { target: { value: dataToUpdate.body } });
  });

  const updateButton = await waitFor(() =>
    screen.getByRole("button", { name: "Update" }),
  );
  await act(async () => updateButton.click());

  await waitFor(() => expect(subject.value).toBe(dataToUpdate.subject));
  await waitFor(() => expect(body.value).toBe(dataToUpdate.body));
});

test("add recipients", async () => {
  const Stub = createRoutesStub([
    {
      path: "/mail/:id",
      loader,
      action,
      Component,
      HydrateFallback: () => <div>Loading...</div>,
      ErrorBoundary,
    },
  ]);

  const account = await waitFor(() =>
    prisma.account.create({
      data: getRandomAccount(),
    }),
  );

  const mail = await waitFor(() =>
    prisma.mail.create({
      data: {
        ...getRandomMail(),
        accountId: account.id,
      },
    }),
  );
  const contact = await waitFor(() =>
    prisma.contact.create({
      data: {
        ...getRandomContact(),
        accountId: account.id,
      },
    }),
  );

  render(<Stub initialEntries={[`/mail/${mail.id}`]} />);

  const contactCheckbox = await waitFor(() =>
    screen.getByLabelText(contact.email),
  );

  await act(async () => {
    fireEvent.click(contactCheckbox);
  });

  const updateButton = await waitFor(() =>
    screen.getByRole("button", { name: "Update" }),
  );

  await act(async () => updateButton.click());

  await waitFor(async () => {
    const recipientOfMail = await prisma.recipientOfMail.findFirst({
      where: {
        mailId: mail.id,
        contactId: contact.id,
      },
    });

    expect(recipientOfMail).not.toBeNull();
  });
});

test("process mail", async () => {
  const account = await waitFor(() =>
    prisma.account.create({
      data: getRandomAccount(),
    }),
  );

  const mail = await waitFor(() =>
    prisma.mail.create({
      data: {
        ...getRandomMail(),
        accountId: account.id,
      },
    }),
  );

  const contact = await waitFor(() =>
    prisma.contact.create({
      data: {
        ...getRandomContact(),
        accountId: account.id,
      },
    }),
  );

  await waitFor(() =>
    prisma.recipientOfMail.create({
      data: {
        mailId: mail.id,
        contactId: contact.id,
      },
    }),
  );

  const Stub = createRoutesStub([
    {
      path: "/mail/:id",
      loader,
      action,
      Component,
      HydrateFallback: () => <div>Loading...</div>,
      ErrorBoundary,
    },
  ]);

  render(<Stub initialEntries={[`/mail/${mail.id}`]} />);

  const processButton = await waitFor(() =>
    screen.getByRole("button", { name: "Process" }),
  );
  await act(async () => processButton.click());

  await waitFor(async () => {
    const mailToProcess = await prisma.mail.findUnique({
      where: { id: mail.id, process: true },
    });
    expect(mailToProcess).not.toBeNull();
  });
});
