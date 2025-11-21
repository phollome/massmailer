import { test as base } from "@playwright/test";
import prisma from "~/db.server";

// See: https://playwright.dev/docs/test-fixtures#adding-global-beforeallafterall-hooks
export const test = base.extend<{}, { forEachWorker: void }>({
  forEachWorker: [
    async ({}, use) => {
      await prisma.account.deleteMany();

      await use();
    },
    { scope: "worker", auto: true },
  ], // automatically starts for every worker.
});
