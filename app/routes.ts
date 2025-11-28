import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/select.tsx"),
  route("/account/:accountId", "routes/account/$accountId.tsx", [
    route(
      "/account/:accountId/contacts",
      "routes/account/$accountId/contacts.tsx",
    ),
    route("/account/:accountId/mails", "routes/account/$accountId/mails.tsx", [
      index("routes/account/$accountId/mails/list.tsx"),
      route(
        "/account/:accountId/mails/add",
        "routes/account/$accountId/mails/add.tsx",
      ),
    ]),
  ]),
  route("/accounts/add", "routes/accounts/add.tsx"),
  route("/mail/:id", "routes/mail/$id.tsx"),
] satisfies RouteConfig;
