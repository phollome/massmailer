import { createRoutesStub } from "react-router";
import Mail, { loader } from "./$id";
import { test } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ErrorBoundary } from "~/root";

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
