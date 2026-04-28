import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });

export const prisma: PrismaClient = global.__prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

