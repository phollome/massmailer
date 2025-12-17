import { beforeAll } from "vitest";
import prisma from "~/db.server";

beforeAll(async () => {
  // Fixes "ReferenceError: ResizeObserver is not defined"
  // See: https://henggana.com/en/blog/fix-jest-resize-observer-is-not-defined
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  await prisma.account.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.mail.deleteMany();
});
