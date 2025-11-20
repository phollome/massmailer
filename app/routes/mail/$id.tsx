import { redirect, useLoaderData, type LoaderFunctionArgs } from "react-router";
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

  return { mail };
}

export async function action(args: LoaderFunctionArgs) {
  const { params } = args;
  const { id } = params;

  return redirect("/");
}

function Mail() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <>
      <h1>{loaderData.mail.subject}</h1>
      <p>{loaderData.mail.body}</p>
    </>
  );
}

export default Mail;
