import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { sql } from "drizzle-orm";

let tableCreated = false;

async function ensureTable() {
  if (tableCreated) return;
  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT ''
    )
  `));
  tableCreated = true;
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    await ensureTable();

    await db.execute(sql`
      INSERT INTO contact_messages (name, email, subject, message, created_at)
      VALUES (${name}, ${email}, ${subject}, ${message}, ${new Date().toISOString()})
    `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
