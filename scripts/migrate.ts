import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

export async function runMigrations() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  console.log("[migrate] connecting...");
  const client = postgres(url, { max: 1, prepare: false });
  const db = drizzle(client);

  console.log("[migrate] applying migrations...");
  await migrate(db, { migrationsFolder: "./server/db/migrations" });

  await client.end({ timeout: 5 });
  console.log("[migrate] done");
}

const isMain =
  process.argv[1] &&
  import.meta.url === new URL(`file://${process.argv[1]}`).href;

if (isMain) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[migrate] failed:", err);
      process.exit(1);
    });
}
