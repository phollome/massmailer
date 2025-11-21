import { invariantResponse } from "@epic-web/invariant";
import { DataList, Heading, Text, Link as LinkStyle } from "@radix-ui/themes";
import {
  Link,
  Outlet,
  useLoaderData,
  type LoaderFunctionArgs,
} from "react-router";
import prisma from "~/db.server";

export async function loader(args: LoaderFunctionArgs) {
  const { params } = args;
  const { accountId } = params;

  invariantResponse(accountId, "Account ID is required", { status: 400 });

  const mails = await prisma.mail.findMany({
    where: { accountId },
  });

  return { mails };
}

function Mails() {
  return (
    <>
      <Heading as="h1" size="4" weight="bold">
        Mails
      </Heading>
      <Outlet />
    </>
  );
}

export default Mails;
