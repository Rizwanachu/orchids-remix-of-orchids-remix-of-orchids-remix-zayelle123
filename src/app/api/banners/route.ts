import { NextResponse } from "next/server";
import { db } from "@/../server/db";
import { banners } from "@/../shared/schema";
import { eq } from "drizzle-orm";

const CDN_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
  "CDN-Cache-Control": "public, max-age=300, stale-while-revalidate=600",
  "Vercel-CDN-Cache-Control": "public, max-age=300, stale-while-revalidate=600",
};

export async function GET() {
  try {
    const activeBanners = await db.select().from(banners).where(eq(banners.isActive, 1));
    return NextResponse.json(activeBanners, { headers: CDN_HEADERS });
  } catch (error: any) {
    console.error("Error fetching banners:", error);
    return NextResponse.json([]);
  }
}
