import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { zayelleEdits } from "@/../shared/schema";
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

    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
    if (body.buttonText !== undefined) updateData.buttonText = body.buttonText;
    if (body.redirectLink !== undefined) updateData.redirectLink = body.redirectLink;
    if (body.productIds !== undefined) updateData.productIds = body.productIds ? JSON.stringify(body.productIds) : null;
    if (body.displayOrder !== undefined) updateData.displayOrder = body.displayOrder;

    const [updated] = await db.update(zayelleEdits)
      .set(updateData)
      .where(eq(zayelleEdits.id, parseInt(id)))
      .returning();

    await logAdminActivity(admin.id, admin.email, "zayelle_edit_updated", `Updated Zayelle Edit item: ${updated.title}`);

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating zayelle edit:", error);
    return NextResponse.json({ error: error.message || "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const [deleted] = await db.delete(zayelleEdits)
      .where(eq(zayelleEdits.id, parseInt(id)))
      .returning();

    await logAdminActivity(admin.id, admin.email, "zayelle_edit_deleted", `Deleted Zayelle Edit item: ${deleted?.title}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting zayelle edit:", error);
    return NextResponse.json({ error: error.message || "Failed to delete item" }, { status: 500 });
  }
}
