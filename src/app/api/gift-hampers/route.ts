import { NextResponse } from "next/server";
import { db } from "@/../server/db";
import { giftHampers } from "@/../shared/schema";
import { asc, eq } from "drizzle-orm";

function parseHamper(h: any) {
  return {
    ...h,
    includedProductIds: (() => {
      if (!h.includedProductIds) return [];
      if (Array.isArray(h.includedProductIds)) return h.includedProductIds.map(Number);
      try { return JSON.parse(h.includedProductIds).map(Number); } catch { return []; }
    })(),
  };
}

export async function GET() {
  try {
    const list = await db
      .select()
      .from(giftHampers)
      .where(eq(giftHampers.isActive, 1))
      .orderBy(asc(giftHampers.displayOrder));
    return NextResponse.json({ hampers: list.map(parseHamper) }, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
        "CDN-Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
        "Vercel-CDN-Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("Error fetching gift hampers:", error);
    return NextResponse.json({ hampers: [] });
  }
}
