import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { db } from "@/../server/db";
import { homepageSettings } from "@/../shared/schema";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await db.select().from(homepageSettings);
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }
    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error("Error fetching homepage settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { settings } = body as { settings: { key: string; value: string }[] };

    if (!Array.isArray(settings)) {
      return NextResponse.json({ error: "Invalid settings format" }, { status: 400 });
    }

    for (const { key, value } of settings) {
      await db
        .insert(homepageSettings)
        .values({ key, value })
        .onConflictDoUpdate({
          target: homepageSettings.key,
          set: { value, updatedAt: new Date() },
        });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating homepage settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
