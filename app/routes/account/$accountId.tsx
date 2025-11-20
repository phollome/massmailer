import { invariantResponse } from "@epic-web/invariant";
import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import prisma from "~/db.server";

export async function loader(args: LoaderFunctionArgs) {
  const { params } = args;
  const { id } = params;

  const account = await prisma.account.findFirst({
    where: { id },
  });

  invariantResponse(account !== null, "Account not found", { status: 404 });

  return { account };
}

function Account() {
  const loaderData = useLoaderData<typeof loader>();
  return <div>{loaderData.account.email}</div>;
}

export default Account;
