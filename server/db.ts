import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema";

const { Pool } = pg;

let pool: pg.Pool | null = null;
let database: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?",
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

function getDb() {
  if (!database) {
    database = drizzle(getPool(), { schema });
  }
  return database;
}

export { getPool as pool };
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});
