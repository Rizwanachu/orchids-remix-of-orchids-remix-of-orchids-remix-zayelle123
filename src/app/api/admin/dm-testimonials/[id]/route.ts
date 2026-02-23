import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { dmTestimonials } from "@/../shared/schema";
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

    const updateData: any = {};
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.alt !== undefined) updateData.alt = body.alt;
    if (body.displayOrder !== undefined) updateData.displayOrder = body.displayOrder;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const [updated] = await db
      .update(dmTestimonials)
      .set(updateData)
      .where(eq(dmTestimonials.id, testimonialId))
      .returning();

    if (!updated) return NextResponse.json({ error: "DM testimonial not found" }, { status: 404 });

    await logAdminActivity(admin.id, admin.email, "dm_testimonial_updated", `DM testimonial #${updated.id} updated`);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating DM testimonial:", error);
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
      .delete(dmTestimonials)
      .where(eq(dmTestimonials.id, testimonialId))
      .returning();

    if (!deleted) return NextResponse.json({ error: "DM testimonial not found" }, { status: 404 });

    await logAdminActivity(admin.id, admin.email, "dm_testimonial_deleted", `DM testimonial #${deleted.id} deleted`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting DM testimonial:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
