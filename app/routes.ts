import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/accounts/configure", "routes/accounts/configure.tsx"),
] satisfies RouteConfig;
