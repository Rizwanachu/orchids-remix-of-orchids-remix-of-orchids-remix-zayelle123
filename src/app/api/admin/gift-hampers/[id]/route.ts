import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { giftHampers } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";
import { eq } from "drizzle-orm";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const hamperId = parseInt(id);
    const body = await request.json();

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.price !== undefined) updateData.price = body.price.toString();
    if (body.includedProductIds !== undefined) updateData.includedProductIds = body.includedProductIds;
    if (body.displayOrder !== undefined) updateData.displayOrder = body.displayOrder;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const [updated] = await db
      .update(giftHampers)
      .set(updateData)
      .where(eq(giftHampers.id, hamperId))
      .returning();

    if (!updated) return NextResponse.json({ error: "Gift hamper not found" }, { status: 404 });

    await logAdminActivity(admin.id, admin.email, "gift_hamper_updated", `Gift hamper "${updated.title}" updated`);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating gift hamper:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const hamperId = parseInt(id);

    const [deleted] = await db
      .delete(giftHampers)
      .where(eq(giftHampers.id, hamperId))
      .returning();

    if (!deleted) return NextResponse.json({ error: "Gift hamper not found" }, { status: 404 });

    await logAdminActivity(admin.id, admin.email, "gift_hamper_deleted", `Gift hamper "${deleted.title}" deleted`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting gift hamper:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
