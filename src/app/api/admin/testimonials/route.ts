import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { communityTestimonials } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";
import { asc } from "drizzle-orm";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const list = await db
      .select()
      .from(communityTestimonials)
      .orderBy(asc(communityTestimonials.displayOrder));
    return NextResponse.json({ testimonials: list });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { quote, author, location, rating, isActive, displayOrder } = body;

    if (!quote || !author) {
      return NextResponse.json({ error: "Quote and author are required" }, { status: 400 });
    }

    const [testimonial] = await db
      .insert(communityTestimonials)
      .values({
        quote,
        author,
        location: location || "",
        rating: rating || 5,
        isActive: isActive !== undefined ? (isActive ? 1 : 0) : 1,
        displayOrder: displayOrder || 0,
        createdAt: new Date().toISOString(),
      })
      .returning();

    await logAdminActivity(
      admin.id,
      admin.email,
      "testimonial_created",
      `Testimonial by ${author} created`
    );

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
