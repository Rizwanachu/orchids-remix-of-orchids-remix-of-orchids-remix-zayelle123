import { NextResponse } from "next/server";
import { db } from "@/../server/db";
import { homepageSettings } from "@/../shared/schema";

const CDN_HEADERS = {
  "Cache-Control": "no-store",
};

export async function GET() {
  try {
    const settings = await db.select().from(homepageSettings);
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }
    return NextResponse.json(settingsMap, { headers: CDN_HEADERS });
  } catch (error) {
    console.error("Error fetching homepage settings:", error);
    return NextResponse.json({});
  }
}
