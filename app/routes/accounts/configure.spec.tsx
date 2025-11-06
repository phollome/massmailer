import { createRoutesStub } from "react-router";
import ConfigureAccount, { loader, action } from "./configure";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { test } from "vitest";
import { act } from "react";
import Home from "../home";

test("failed validation (empty)", async () => {
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: ConfigureAccount,
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
      Component: ConfigureAccount,
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
      Component: Home,
      loader: async () => null,
      HydrateFallback: () => <div>Loading...</div>,
    },
    {
      path: "/accounts/configure",
      Component: ConfigureAccount,
      loader,
      action,
      HydrateFallback: () => <div>Loading...</div>,
    },
  ]);
  render(<Stub initialEntries={["/accounts/configure"]} />);

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

  // Since we redirect on success, we can check that the form is no longer in the document
  await waitFor(() => {
    if (screen.queryByLabelText("Email")) {
      throw new Error("Form still present, submission may have failed");
    }
  });
});
