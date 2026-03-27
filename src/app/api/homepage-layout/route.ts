import { NextResponse } from "next/server";
import { db } from "@/../server/db";
import { homepageSections } from "@/../shared/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const sections = await db.select().from(homepageSections).orderBy(asc(homepageSections.displayOrder));
    return NextResponse.json({ sections }, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "CDN-Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        "Vercel-CDN-Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching homepage layout:", error);
    return NextResponse.json({ sections: [] });
  }
}
