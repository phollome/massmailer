import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  await prisma.$connect();
} catch (error) {
  console.error("Database connection error:", error);
}

export default prisma;
