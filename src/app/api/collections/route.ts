import { NextResponse } from "next/server";
import { db } from "@/../server/db";
import { collections } from "@/../shared/schema";
import { asc } from "drizzle-orm";

const CDN_HEADERS = {
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
  "CDN-Cache-Control": "public, max-age=3600, stale-while-revalidate=7200",
  "Vercel-CDN-Cache-Control": "public, max-age=3600, stale-while-revalidate=7200",
};

export async function GET() {
  try {
    const list = await db.select().from(collections).orderBy(asc(collections.displayOrder));
    return NextResponse.json({ collections: list }, { headers: CDN_HEADERS });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json({ collections: [] });
  }
}
