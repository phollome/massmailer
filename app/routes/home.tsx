import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import type { LoaderFunctionArgs } from "react-router";
import prisma from "~/db.server";

export function loader(args: LoaderFunctionArgs) {
  const _dbClient = prisma;
  return null;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <Welcome />;
}
