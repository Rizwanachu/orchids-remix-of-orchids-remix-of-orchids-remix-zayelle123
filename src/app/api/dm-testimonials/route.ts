import { NextResponse } from "next/server";
import { db } from "@/../server/db";
import { dmTestimonials } from "@/../shared/schema";
import { asc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db
      .select()
      .from(dmTestimonials)
      .where(eq(dmTestimonials.isActive, true))
      .orderBy(asc(dmTestimonials.displayOrder));
    return NextResponse.json({ testimonials: list });
  } catch (error) {
    console.error("Error fetching DM testimonials:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
