import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

const globalForPostgres = globalThis as unknown as {
  pgClient: ReturnType<typeof postgres> | undefined;
};

const pgClient =
  globalForPostgres.pgClient ??
  postgres(connectionString ?? "postgres://_:_@localhost:5432/_unset", {
    max: 10,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPostgres.pgClient = pgClient;
}

export const db = drizzle(pgClient, { schema, casing: "snake_case" });
export type Db = typeof db;
export { schema };
