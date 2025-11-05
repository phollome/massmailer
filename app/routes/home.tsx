import type { Route } from "./+types/home";
import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import prisma from "~/db.server";

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
    return <div>No mail account configured.</div>;
  }

  return <div>{loaderData.email}</div>;
}
