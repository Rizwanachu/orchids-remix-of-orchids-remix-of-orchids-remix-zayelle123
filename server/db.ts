import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import path from "path";
import * as schema from "../shared/schema";

const dbPath = path.join(process.cwd(), "zayelle.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

let database: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDb() {
  if (!database) {
    database = drizzle(sqlite, { schema });
  }
  return database;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});
