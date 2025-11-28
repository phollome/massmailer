import { createRoutesStub } from "react-router";
import AddAccount, { loader, action } from "./add";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, test } from "vitest";
import Select from "../select";
import prisma from "~/db.server";
import { act } from "react";
import Account, { loader as accountLoader } from "../account/$accountId";
import Mails, { loader as mailsLoader } from "../account/$accountId/mails";

test("failed validation (empty)", async () => {
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: AddAccount,
      loader,
      HydrateFallback: () => <div>Loading...</div>,
    },
  ]);

  render(<Stub />);

  const submit = await waitFor(() => {
    return screen.getByRole("button", { name: "Submit" });
  });
  await act(async () => submit.click());
  await waitFor(() => screen.getByText("Invalid email address"));
  await waitFor(() => screen.getByText("Password is required"));
  await waitFor(() => screen.getByText("Invalid host"));
  await waitFor(() => screen.getByText("Invalid port"));
});

test("failed validation (invalid values)", async () => {
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: AddAccount,
      loader,
      HydrateFallback: () => <div>Loading...</div>,
    },
  ]);

  render(<Stub />);

  const email = await waitFor(() => screen.getByLabelText("Email"));
  await act(async () => {
    fireEvent.input(email, { target: { value: "invalid" } });
  });
  const password = await waitFor(() => screen.getByLabelText("Password"));
  await act(async () => {
    fireEvent.input(password, { target: { value: "short" } });
  });
  const host = await waitFor(() => screen.getByLabelText("Host"));
  await act(async () => {
    fireEvent.input(host, { target: { value: "invalid host!" } });
  });
  const port = await waitFor(() => screen.getByLabelText("Port"));
  await act(async () => {
    fireEvent.input(port, { target: { value: "70000" } });
  });

  const submit = await waitFor(() => {
    return screen.getByRole("button", { name: "Submit" });
  });
  await act(async () => submit.click());
  await waitFor(() => screen.getByText("Invalid email address"));
  await waitFor(() =>
    screen.getByText("Password must be at least 8 characters long"),
  );
  await waitFor(() => screen.getByText("Invalid host"));
  await waitFor(() => screen.getByText("Invalid port (1-65535)"));
});

test("successful submission", async () => {
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: Select,
      loader: async () => {
        return { accounts: [] };
      },
      HydrateFallback: () => {
        return <div>Loading...</div>;
      },
    },
    {
      path: "/accounts/add",
      Component: AddAccount,
      loader,
      action,
      HydrateFallback: () => {
        return <div>Loading...</div>;
      },
    },
    {
      path: "/account/:accountId",
      Component: Account,
      loader: accountLoader,
      HydrateFallback: () => {
        return <div>Loading...</div>;
      },
    },
    {
      path: "/account/:accountId/mails",
      Component: Mails,
      loader: mailsLoader,
      HydrateFallback: () => {
        return <div>Loading...</div>;
      },
    },
  ]);
  render(<Stub initialEntries={["/accounts/add"]} />);

  const email = await waitFor(() => screen.getByLabelText("Email"));
  await act(async () => {
    fireEvent.input(email, { target: { value: "test@example.com" } });
  });
  const password = await waitFor(() => screen.getByLabelText("Password"));
  await act(async () => {
    fireEvent.input(password, { target: { value: "validpassword" } });
  });
  const host = await waitFor(() => screen.getByLabelText("Host"));
  await act(async () => {
    fireEvent.input(host, { target: { value: "smtp.example.com" } });
  });
  const port = await waitFor(() => screen.getByLabelText("Port"));
  await act(async () => {
    fireEvent.input(port, { target: { value: "587" } });
  });

  const submit = await waitFor(() => {
    return screen.getByRole("button", { name: "Submit" });
  });
  await act(async () => submit.click());

  await waitFor(async () => {
    const account = await prisma.account.findUnique({
      where: { email: "test@example.com" },
    });
    expect(account).not.toBeNull();
  });
});
