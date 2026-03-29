import { NextResponse } from "next/server";
import { db } from "@/../server/db";
import { zayelleEdits } from "@/../shared/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const items = await db.select().from(zayelleEdits).orderBy(asc(zayelleEdits.displayOrder));
    return NextResponse.json(items, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
        "CDN-Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
        "Vercel-CDN-Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      },
    });
  } catch (error: any) {
    console.error("Error fetching zayelle edits:", error);
    return NextResponse.json([]);
  }
}
