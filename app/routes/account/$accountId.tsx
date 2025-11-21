import { invariantResponse } from "@epic-web/invariant";
import {
  NavLink,
  Outlet,
  useLoaderData,
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
  return (
    <>
      <div>
        {loaderData.account.email}
        <NavLink to="./mails">Mails</NavLink>
        <NavLink to="./contacts">Contacts</NavLink>
        <Outlet />
      </div>
    </>
  );
}

export default Account;
