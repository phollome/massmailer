import { beforeEach } from "vitest";
import prisma from "~/db.server";

beforeEach(async () => {
  await prisma.mailAccount.deleteMany();
});
