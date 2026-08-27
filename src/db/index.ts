import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __ivyPgPool: Pool | undefined;
}

const pool =
  global.__ivyPgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  global.__ivyPgPool = pool;
}

export const db = drizzle(pool, { schema });
