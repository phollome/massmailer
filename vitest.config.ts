import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tailwindcss(), tsconfigPaths()],
  test: {
    setupFiles: ["/tests/setup.ts"],
    globals: true,
    environment: "jsdom",
  },
});
