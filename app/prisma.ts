import { PrismaClient } from "../generated/client/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const connectionString = process.env.DATABASE_URL?.startsWith("file:")
  ? "file://" +
    path.join(process.cwd(), process.env.DATABASE_URL.replace("file:", ""))
  : process.env.DATABASE_URL?.replace("libsql://", "https://"); // FORCE HTTPs for Turso on Vercel

console.log(
  "Using connection string:",
  process.env.DATABASE_URL,
  connectionString,
);

const config = {
  url: connectionString!,
} as any;

console.log("--- DEBUG VERCEL ENV ---");
console.log("DB_URL provided:", !!process.env.DATABASE_URL);
console.log(
  "DB_URL value (first 10 chars):",
  process.env.DATABASE_URL?.substring(0, 10),
);
console.log("TURSO_AUTH_TOKEN provided:", !!process.env.TURSO_AUTH_TOKEN);
console.log(
  "TURSO_AUTH_TOKEN length:",
  process.env.TURSO_AUTH_TOKEN ? process.env.TURSO_AUTH_TOKEN.length : 0,
);
console.log(
  "TURSO_AUTH_TOKEN first 10 chars:",
  process.env.TURSO_AUTH_TOKEN
    ? process.env.TURSO_AUTH_TOKEN.substring(0, 10)
    : "N/A",
);
console.log("------------------------");

if (process.env.TURSO_AUTH_TOKEN) {
  config.authToken = process.env.TURSO_AUTH_TOKEN.trim(); // Added trim() just in case
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
