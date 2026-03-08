import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { dmTestimonials } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";
import { asc } from "drizzle-orm";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const list = await db.select().from(dmTestimonials).orderBy(asc(dmTestimonials.displayOrder));
    return NextResponse.json({ testimonials: list });
  } catch (error) {
    console.error("Error fetching DM testimonials:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { imageUrl, alt, displayOrder, isActive } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    const [testimonial] = await db
      .insert(dmTestimonials)
      .values({
        imageUrl,
        alt: alt || "",
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? (isActive ? 1 : 0) : 1,
      })
      .returning();

    await logAdminActivity(admin.id, admin.email, "dm_testimonial_created", `DM testimonial created`);

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error("Error creating DM testimonial:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
