import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { communityTestimonials } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";
import { eq } from "drizzle-orm";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const testimonialId = parseInt(id);
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.quote !== undefined) updateData.quote = body.quote;
    if (body.author !== undefined) updateData.author = body.author;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.rating !== undefined) updateData.rating = body.rating;
    if (body.isActive !== undefined) updateData.isActive = body.isActive ? 1 : 0;
    if (body.displayOrder !== undefined) updateData.displayOrder = body.displayOrder;

    const [updated] = await db
      .update(communityTestimonials)
      .set(updateData)
      .where(eq(communityTestimonials.id, testimonialId))
      .returning();

    if (!updated) return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });

    await logAdminActivity(
      admin.id,
      admin.email,
      "testimonial_updated",
      `Testimonial by ${updated.author} updated`
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating testimonial:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const testimonialId = parseInt(id);

    const [deleted] = await db
      .delete(communityTestimonials)
      .where(eq(communityTestimonials.id, testimonialId))
      .returning();

    if (!deleted) return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });

    await logAdminActivity(
      admin.id,
      admin.email,
      "testimonial_deleted",
      `Testimonial by ${deleted.author} deleted`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
