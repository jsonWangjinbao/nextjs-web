import { PrismaClient } from "../generated/client/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const connectionString = process.env.DATABASE_URL?.startsWith("file:")
  ? "file://" +
    path.join(process.cwd(), process.env.DATABASE_URL.replace("file:", ""))
  : process.env.DATABASE_URL;

console.log("=== PRISMA CLIENT INITIALIZATION ===");
console.log("Connection string:", connectionString);
console.log("TURSO_AUTH_TOKEN exists:", !!process.env.TURSO_AUTH_TOKEN);
console.log("TURSO_AUTH_TOKEN length:", process.env.TURSO_AUTH_TOKEN?.length);

// Create config object for LibSQL
const libsqlConfig: any = {
  url: connectionString!,
};

// Add auth token if connecting to Turso
if (process.env.TURSO_AUTH_TOKEN) {
  libsqlConfig.authToken = process.env.TURSO_AUTH_TOKEN;
  console.log("✅ Auth token added to config");
} else {
  console.log("ℹ️  No TURSO_AUTH_TOKEN (using local file database)");
}

// CRITICAL FIX: Pass config object directly to PrismaLibSql
// It will create its own client internally using this config
const adapter = new PrismaLibSql(libsqlConfig);

console.log("✅ Prisma adapter initialized successfully");

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
