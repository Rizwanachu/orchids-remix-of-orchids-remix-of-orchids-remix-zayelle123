import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  try {
    const envPath = path.resolve(__dirname, "../.env.local");
    const envContent = fs.readFileSync(envPath, "utf8");
    const match = envContent.match(/^DATABASE_URL=(.+)$/m);
    if (match) databaseUrl = match[1].trim().replace(/^["']|["']$/g, "");
  } catch {}
}

if (!databaseUrl) {
  console.error("ERROR: DATABASE_URL is not set.");
  process.exit(1);
}

const { Client } = pg;
const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

await client.connect();

const tablesRes = await client.query(`
  SELECT tablename FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY tablename
`);

const tables = tablesRes.rows.map(r => r.tablename);
const backupDir = path.resolve(__dirname, "../db-backups");
fs.mkdirSync(backupDir, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
const backupFile = path.join(backupDir, `zayelle_backup_${timestamp}.sql`);

const lines = [];
lines.push(`-- Zayelle Database Backup`);
lines.push(`-- Created: ${new Date().toISOString()}`);
lines.push(`-- Tables: ${tables.join(", ")}`);
lines.push("");

for (const table of tables) {
  lines.push(`-- ==================== ${table} ====================`);

  const countRes = await client.query(`SELECT COUNT(*) FROM "${table}"`);
  const count = parseInt(countRes.rows[0].count, 10);

  if (count === 0) {
    lines.push(`-- (no rows)`);
    lines.push("");
    continue;
  }

  const dataRes = await client.query(`SELECT * FROM "${table}"`);
  const cols = dataRes.fields.map(f => `"${f.name}"`).join(", ");

  lines.push(`DELETE FROM "${table}";`);

  for (const row of dataRes.rows) {
    const values = dataRes.fields.map(f => {
      const v = row[f.name];
      if (v === null || v === undefined) return "NULL";
      if (typeof v === "number" || typeof v === "boolean") return String(v);
      if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
      return `'${String(v).replace(/'/g, "''")}'`;
    }).join(", ");
    lines.push(`INSERT INTO "${table}" (${cols}) VALUES (${values});`);
  }

  lines.push(`-- ${count} row(s) restored`);
  lines.push("");
}

await client.end();

fs.writeFileSync(backupFile, lines.join("\n"), "utf8");

const size = fs.statSync(backupFile).size;
const sizeKb = (size / 1024).toFixed(1);

console.log(`Backup saved: ${backupFile} (${sizeKb} KB)`);
console.log(`Tables backed up: ${tables.join(", ")}`);
console.log("");
console.log("To restore:");
console.log(`  psql "$DATABASE_URL" < ${backupFile}`);
