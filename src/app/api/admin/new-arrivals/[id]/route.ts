import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { newArrivals } from "@/../shared/schema";
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
    const updateData: any = {};

    if (body.displayOrder !== undefined) updateData.displayOrder = body.displayOrder;

    const [updated] = await db
      .update(newArrivals)
      .set(updateData)
      .where(eq(newArrivals.id, parseInt(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "New arrival not found" }, { status: 404 });
    }

    await logAdminActivity(admin.id, admin.email, "new_arrival_updated", `Updated new arrival #${id} display order`);

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating new arrival:", error);
    return NextResponse.json({ error: error.message || "Failed to update new arrival" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const [deleted] = await db
      .delete(newArrivals)
      .where(eq(newArrivals.id, parseInt(id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "New arrival not found" }, { status: 404 });
    }

    await logAdminActivity(admin.id, admin.email, "new_arrival_removed", `Removed product #${deleted.productId} from new arrivals`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting new arrival:", error);
    return NextResponse.json({ error: error.message || "Failed to delete new arrival" }, { status: 500 });
  }
}
