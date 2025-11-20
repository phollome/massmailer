import { beforeAll } from "vitest";
import prisma from "~/db.server";

beforeAll(async () => {
  await prisma.account.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.mail.deleteMany();
});
