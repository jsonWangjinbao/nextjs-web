import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";

// Read from arguments or env
const url = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !url.startsWith("libsql")) {
  console.error("Error: DATABASE_URL must be a libsql:// URL. Got:", url);
  process.exit(1);
}

if (!authToken) {
  console.error("Error: TURSO_AUTH_TOKEN is missing.");
  process.exit(1);
}

console.log(`Connecting to Turso: ${url}`);

const client = createClient({
  url,
  authToken,
});

async function main() {
  try {
    const sqlPath = path.resolve("init_turso.sql");
    if (!fs.existsSync(sqlPath)) {
      console.error("Detailed SQL file init_turso.sql not found!");
      process.exit(1);
    }

    const sqlScript = fs.readFileSync(sqlPath, "utf-8");
    console.log("Reading SQL script...");

    // LibSQL executeMultiple handles transaction automatically for multiple statements usually
    await client.executeMultiple(sqlScript);

    console.log("✅ Successfully synced schema to Turso!");
  } catch (err) {
    console.error("❌ Failed to sync schema:", err);
    process.exit(1);
  } finally {
    client.close();
  }
}

main();
