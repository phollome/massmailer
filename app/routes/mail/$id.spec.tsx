import { createRoutesStub } from "react-router";
import Mail, { loader, action } from "./$id";
import { expect, test } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ErrorBoundary } from "~/root";
import prisma from "~/db.server";
import { getRandomMail } from "tests/utils";
import { act } from "react";

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
      Component: Mail,
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

  const save = await waitFor(() =>
    screen.getByRole("button", { name: "Update" }),
  );
  await act(async () => save.click());

  await waitFor(() => expect(subject.value).toBe(dataToUpdate.subject));
  await waitFor(() => expect(body.value).toBe(dataToUpdate.body));
});
