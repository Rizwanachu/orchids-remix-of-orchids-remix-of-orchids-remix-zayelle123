import { NextResponse } from "next/server";
import { db } from "@/../server/db";
import { homepageSettings } from "@/../shared/schema";

export async function GET() {
  try {
    const settings = await db.select().from(homepageSettings);
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }
    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error("Error fetching homepage settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}
