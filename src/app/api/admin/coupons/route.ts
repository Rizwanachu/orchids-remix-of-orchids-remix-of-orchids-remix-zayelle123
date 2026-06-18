import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { coupons } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";
import { desc } from "drizzle-orm";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const couponsList = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
    return NextResponse.json({ coupons: couponsList });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { code, discountType, discountValue, minOrderValue, maxUsage, expiryDate, active, couponType, autoApply, applicableCollection } = body;

    if (!code || !discountType || !discountValue) {
      return NextResponse.json({ error: "Code, discount type, and discount value are required" }, { status: 400 });
    }

    const [coupon] = await db
      .insert(coupons)
      .values({
        code: code.toUpperCase(),
        discountType,
        discountValue: String(discountValue),
        minOrderValue: minOrderValue ? String(minOrderValue) : null,
        maxUsage: maxUsage || null,
        expiryDate: expiryDate || null,
        active: active !== undefined ? (active ? 1 : 0) : 1,
        couponType: couponType || "standard",
        autoApply: autoApply ? 1 : 0,
        applicableCollection: applicableCollection || "",
      })
      .returning();

    await logAdminActivity(admin.id, admin.email, "coupon_created", `Coupon ${code.toUpperCase()} created`);

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
