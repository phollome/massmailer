import { beforeAll } from "vitest";
import prisma from "~/db.server";

beforeAll(async () => {
  await prisma.mailAccount.deleteMany();
});
