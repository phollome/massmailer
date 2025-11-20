import { redirect, type LoaderFunctionArgs } from "react-router";
import { invariantResponse } from "@epic-web/invariant";
import prisma from "~/db.server";

export async function loader(args: LoaderFunctionArgs) {
  const { params } = args;
  const { id } = params;

  const mail = await prisma.mail.findFirst({
    where: { id },
  });

  invariantResponse(mail !== null, "Mail not found", {
    status: 404,
  });

  return { id };
}

export async function action(args: LoaderFunctionArgs) {
  const { params } = args;
  const { id } = params;

  return redirect("/");
}

function Mail() {
  return <div>Mail Detail Page</div>;
}

export default Mail;
