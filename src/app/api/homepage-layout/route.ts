import { NextResponse } from "next/server";
import { db } from "@/../server/db";
import { homepageSections } from "@/../shared/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const sections = await db.select().from(homepageSections).orderBy(asc(homepageSections.displayOrder));
    return NextResponse.json({ sections }, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        "CDN-Cache-Control": "public, max-age=3600, stale-while-revalidate=7200",
        "Vercel-CDN-Cache-Control": "public, max-age=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("Error fetching homepage layout:", error);
    return NextResponse.json({ sections: [] });
  }
}
