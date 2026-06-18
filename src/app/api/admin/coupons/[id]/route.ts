import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { coupons } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";
import { eq } from "drizzle-orm";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const couponId = parseInt(id);
    const body = await request.json();

    const updateData: any = {};
    if (body.code !== undefined) updateData.code = body.code.toUpperCase();
    if (body.discountType !== undefined) updateData.discountType = body.discountType;
    if (body.discountValue !== undefined) updateData.discountValue = String(body.discountValue);
    if (body.minOrderValue !== undefined) updateData.minOrderValue = body.minOrderValue ? String(body.minOrderValue) : null;
    if (body.maxUsage !== undefined) updateData.maxUsage = body.maxUsage;
    if (body.expiryDate !== undefined) updateData.expiryDate = body.expiryDate || null;
    if (body.active !== undefined) updateData.active = body.active ? 1 : 0;
    if (body.couponType !== undefined) updateData.couponType = body.couponType || "standard";
    if (body.autoApply !== undefined) updateData.autoApply = body.autoApply ? 1 : 0;
    if (body.applicableCollection !== undefined) updateData.applicableCollection = body.applicableCollection || "";

    const [updated] = await db
      .update(coupons)
      .set(updateData)
      .where(eq(coupons.id, couponId))
      .returning();

    if (!updated) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });

    await logAdminActivity(admin.id, admin.email, "coupon_updated", `Coupon ${updated.code} updated`);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const couponId = parseInt(id);

    const [deleted] = await db
      .delete(coupons)
      .where(eq(coupons.id, couponId))
      .returning();

    if (!deleted) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });

    await logAdminActivity(admin.id, admin.email, "coupon_deleted", `Coupon ${deleted.code} deleted`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
