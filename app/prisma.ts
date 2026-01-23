import { PrismaClient } from "../generated/client/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const connectionString = process.env.DATABASE_URL?.startsWith("file:")
  ? "file://" +
    path.join(process.cwd(), process.env.DATABASE_URL.replace("file:", ""))
  : process.env.DATABASE_URL;

console.log("Using connection string:", connectionString);

const config = {
  url: connectionString!,
} as any;

if (process.env.TURSO_AUTH_TOKEN) {
  config.authToken = process.env.TURSO_AUTH_TOKEN;
}

const libsql = createClient(config);

// Hack: Inject url for Prisma adapter compatibility
(libsql as any).url = connectionString;

const adapter = new PrismaLibSql(libsql as any);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
