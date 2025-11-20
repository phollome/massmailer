import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/account/:accountId", "routes/account/$accountId.tsx"),
  route(
    "/account/:accountId/contacts/add",
    "routes/account/$accountId/contacts/add.tsx",
  ),
  route("/accounts/add", "routes/accounts/add.tsx"),
  route("/mails/add", "routes/mails/add.tsx"),
  route("/mail/:id", "routes/mail/$id.tsx"),
] satisfies RouteConfig;
