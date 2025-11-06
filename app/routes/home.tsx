import { Callout } from "@radix-ui/themes";
import type { Route } from "./+types/home";
import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import prisma from "~/db.server";
import { InfoCircledIcon } from "@radix-ui/react-icons";

export async function loader(args: LoaderFunctionArgs) {
  const mailAccount = await prisma.mailAccount.findFirst();

  if (mailAccount === null) {
    return null;
  }

  return mailAccount;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const loaderData = useLoaderData<typeof loader>();

  if (loaderData === null) {
    return (
      <Callout.Root color="red">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>No mail account configured.</Callout.Text>
      </Callout.Root>
    );
  }

  return <div>{loaderData.email}</div>;
}
