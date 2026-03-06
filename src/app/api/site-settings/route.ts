import { NextResponse } from "next/server";
import { db } from "@/../server/db";
import { siteSettings } from "@/../shared/schema";

export async function GET() {
  try {
    const settings = await db.select().from(siteSettings);
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return NextResponse.json(map);
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return NextResponse.json({});
  }
}
