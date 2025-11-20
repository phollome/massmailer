import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/accounts/add", "routes/accounts/add.tsx"),
  route("/contacts/add", "routes/contacts/add.tsx"),
  route("/mails/add", "routes/mails/add.tsx"),
  route("/mail/:id", "routes/mail/$id.tsx"),
] satisfies RouteConfig;
