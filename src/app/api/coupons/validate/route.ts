import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { coupons } from "@/../shared/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { code, orderTotal } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code.toUpperCase()));

    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    }

    if (!coupon.active) {
      return NextResponse.json({ error: "This coupon is no longer active" }, { status: 400 });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }

    if (coupon.maxUsage && coupon.currentUsage >= coupon.maxUsage) {
      return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
    }

    if (coupon.minOrderValue && orderTotal && parseFloat(String(orderTotal)) < parseFloat(String(coupon.minOrderValue))) {
      return NextResponse.json({
        error: `Minimum order value of ₹${coupon.minOrderValue} required`,
      }, { status: 400 });
    }

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = orderTotal ? (parseFloat(String(orderTotal)) * parseFloat(String(coupon.discountValue))) / 100 : 0;
    } else {
      discountAmount = parseFloat(String(coupon.discountValue));
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: parseFloat(String(coupon.discountValue)),
        discountAmount: Math.round(discountAmount * 100) / 100,
      },
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
