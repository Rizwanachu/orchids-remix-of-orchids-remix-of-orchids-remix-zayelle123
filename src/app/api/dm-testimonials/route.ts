import { NextResponse } from "next/server";
import { db } from "@/../server/db";
import { dmTestimonials } from "@/../shared/schema";
import { asc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db
      .select()
      .from(dmTestimonials)
      .where(eq(dmTestimonials.isActive, 1))
      .orderBy(asc(dmTestimonials.displayOrder));
    return NextResponse.json({ testimonials: list }, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "CDN-Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        "Vercel-CDN-Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching DM testimonials:", error);
    return NextResponse.json({ testimonials: [] });
  }
}
