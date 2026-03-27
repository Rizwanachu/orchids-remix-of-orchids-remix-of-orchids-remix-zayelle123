import { NextResponse } from "next/server";
import { db } from "@/../server/db";
import { communityTestimonials } from "@/../shared/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db
      .select()
      .from(communityTestimonials)
      .where(eq(communityTestimonials.isActive, 1))
      .orderBy(asc(communityTestimonials.displayOrder));
    return NextResponse.json({ testimonials: list }, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        "CDN-Cache-Control": "public, max-age=3600, stale-while-revalidate=7200",
        "Vercel-CDN-Cache-Control": "public, max-age=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json({ testimonials: [] });
  }
}
