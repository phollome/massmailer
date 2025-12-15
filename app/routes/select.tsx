import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Button, Callout, Flex, Link as LinkStyle } from "@radix-ui/themes";
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { SitesHeading } from "~/components/Sites";
import prisma from "~/db.server";
import type { Route } from "./+types/select";

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

export default function Select() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <>
      <SitesHeading>Select Account</SitesHeading>
      <Flex direction="column" gap="4" asChild>
        {loaderData.accounts.length > 0 ? (
          <ul>
            {loaderData.accounts.map((account) => {
              return (
                <li key={account.id}>
                  <LinkStyle asChild size="4">
                    <Link to={`/account/${account.id}/mails`}>
                      {account.email}
                    </Link>
                  </LinkStyle>
                </li>
              );
            })}
          </ul>
        ) : (
          <Callout.Root color="red">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>No mail account configured.</Callout.Text>
          </Callout.Root>
        )}
      </Flex>
      <Flex direction="column" gap="2" mt="6">
        <Button size="3" variant="outline" asChild>
          <Link to="/accounts/add">Add Account</Link>
        </Button>
      </Flex>
    </>
  );
}
