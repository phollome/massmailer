import { invariantResponse } from "@epic-web/invariant";
import { DataList, Text, Link as LinkStyle } from "@radix-ui/themes";
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router";
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

function MailList() {
  const loaderData = useLoaderData<typeof loader>();
  return (
    <>
      <LinkStyle asChild>
        <Link to="add">Add Mail</Link>
      </LinkStyle>
      {loaderData.mails.length > 0 ? (
        <DataList.Root orientation="horizontal">
          {loaderData.mails.map((mail) => (
            <DataList.Item key={mail.id}>
              <DataList.Label>Subject</DataList.Label>
              <Text>{mail.subject}</Text>
            </DataList.Item>
          ))}
        </DataList.Root>
      ) : (
        <Text>No mails found.</Text>
      )}
    </>
  );
}

export default MailList;
