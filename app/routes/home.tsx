import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Callout, Link as LinkStyle } from "@radix-ui/themes";
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router";
import prisma from "~/db.server";
import type { Route } from "./+types/home";

export async function loader(args: LoaderFunctionArgs) {
  const accounts = await prisma.account.findMany();

  return { accounts };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const loaderData = useLoaderData<typeof loader>();

  if (loaderData.accounts.length === 0) {
    return (
      <Callout.Root color="red">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          No mail account configured.{" "}
          <LinkStyle asChild>
            <Link to="/accounts/add" className="Link">
              Configure account
            </Link>
          </LinkStyle>
        </Callout.Text>
      </Callout.Root>
    );
  }

  return (
    <ul>
      {loaderData.accounts.map((account) => {
        return (
          <li key={account.id}>
            <LinkStyle asChild>
              <Link to={`/account/${account.id}/contacts`}>
                {account.email}
              </Link>
            </LinkStyle>
          </li>
        );
      })}
    </ul>
  );
}
