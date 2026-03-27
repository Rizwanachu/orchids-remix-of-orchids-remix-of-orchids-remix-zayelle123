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
    return NextResponse.json(map, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "CDN-Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        "Vercel-CDN-Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return NextResponse.json({});
  }
}
