import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import {
  Box,
  Code,
  Container,
  Flex,
  Heading,
  Text,
  Theme,
} from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { useEffect, useState } from "react";
import type { Route } from "./+types/root";
import "./app.css";

export function Layout({ children }: { children: React.ReactNode }) {
  const [appearance, setAppearance] = useState<"light" | "dark">("dark");

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      typeof window.matchMedia !== "undefined"
    ) {
      setAppearance(
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
      );
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Theme appearance={appearance} radius="large">
          {children}
        </Theme>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function AppContainer(props: { children: React.ReactNode }) {
  return (
    <Container size={"1"}>
      <Flex
        direction="row"
        justify="center"
        align="center"
        p="4"
        minHeight="100vh"
      >
        <Box
          className="rounded-xl border w-full h-full p-6"
          style={{
            backgroundColor: "var(--accent-2)",
            borderColor: "var(--accent-6)",
          }}
        >
          {props.children}
        </Box>
      </Flex>
    </Container>
  );
}

export default function App() {
  return (
    <AppContainer>
      <Outlet />
    </AppContainer>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      message = "404";
    }
    if (typeof error.data === "string") {
      details = error.data;
    }
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <AppContainer>
      <Heading size="5" as="h1">
        {message}
      </Heading>
      <Text as="p">{details}</Text>
      {typeof stack !== "undefined" && (
        <Code color="crimson" wrap="balance">
          {stack}
        </Code>
      )}
    </AppContainer>
  );
}
