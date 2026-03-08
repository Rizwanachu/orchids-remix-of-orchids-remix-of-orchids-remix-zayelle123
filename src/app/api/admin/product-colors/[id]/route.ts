import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { productColors } from "@/../shared/schema";
import { eq } from "drizzle-orm";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, any> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.hexValue !== undefined) updateData.hexValue = body.hexValue;

    const [updated] = await db.update(productColors)
      .set(updateData)
      .where(eq(productColors.id, parseInt(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Color not found" }, { status: 404 });
    }

    await logAdminActivity(admin.id, admin.email, "color_updated", `Updated color: ${updated.name}`);

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating color:", error);
    return NextResponse.json({ error: error.message || "Failed to update color" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const [deleted] = await db.delete(productColors)
      .where(eq(productColors.id, parseInt(id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Color not found" }, { status: 404 });
    }

    await logAdminActivity(admin.id, admin.email, "color_deleted", `Deleted color: ${deleted.name}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting color:", error);
    return NextResponse.json({ error: error.message || "Failed to delete color" }, { status: 500 });
  }
}
