import { beforeEach } from "vitest";
import prisma from "~/db.server";

beforeEach(async () => {
  await prisma.mailAccount.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.mail.deleteMany();
});
