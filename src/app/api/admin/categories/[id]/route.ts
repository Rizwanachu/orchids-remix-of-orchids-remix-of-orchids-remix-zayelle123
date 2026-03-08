import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { categories } from "@/../shared/schema";
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
    if (body.value !== undefined) updateData.value = body.value;
    if (body.displayOrder !== undefined) updateData.displayOrder = body.displayOrder;

    const [updated] = await db.update(categories)
      .set(updateData)
      .where(eq(categories.id, parseInt(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await logAdminActivity(admin.id, admin.email, "category_updated", `Updated category: ${updated.name}`);

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating category:", error);
    if (error.message?.includes("unique") || error.code === "23505") {
      return NextResponse.json({ error: "A category with this value already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const [deleted] = await db.delete(categories)
      .where(eq(categories.id, parseInt(id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await logAdminActivity(admin.id, admin.email, "category_deleted", `Deleted category: ${deleted.name}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ error: error.message || "Failed to delete category" }, { status: 500 });
  }
}
