import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema";

const rawUrl = process.env.DATABASE_URL!;
const connectionUrl = rawUrl.replace(/-pooler\./, ".");

const client = postgres(connectionUrl, {
  prepare: false,
});

let database: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDb() {
  if (!database) {
    database = drizzle(client, { schema });
  }
  return database;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});
