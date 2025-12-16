import { invariantResponse } from "@epic-web/invariant";
import { Link as LinkStyle, Strong, TabNav, Text } from "@radix-ui/themes";
import {
  Link,
  NavLink,
  Outlet,
  useLoaderData,
  useLocation,
  type LoaderFunctionArgs,
} from "react-router";
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
  const location = useLocation();
  return (
    <>
      <Text as="p" size="1" align="right">
        Selected account: <Strong>{loaderData.account.email}</Strong> <br />
        <LinkStyle asChild>
          <Link to="/">Back to account selection</Link>
        </LinkStyle>
      </Text>
      <TabNav.Root size="2">
        <TabNav.Link asChild active={location.pathname.includes("/mails")}>
          <NavLink to="./mails">Mails</NavLink>
        </TabNav.Link>
        <TabNav.Link asChild active={location.pathname.includes("/contacts")}>
          <NavLink to="./contacts">Contacts</NavLink>
        </TabNav.Link>
      </TabNav.Root>
      <Outlet />
    </>
  );
}

export default Account;
