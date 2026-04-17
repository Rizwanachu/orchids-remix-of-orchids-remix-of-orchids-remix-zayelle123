import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/../server/db";
import { orders, orderItems } from "@/../shared/schema";
import { sql } from "drizzle-orm";
import { sendOrderConfirmationEmail, sendNewOrderNotificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      totalAmount,
      couponCode,
      discountAmount,
    } = body;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    for (const it of items || []) {
      if (it.bundleType) {
        const cs = Array.isArray(it.colorSelections) ? it.colorSelections : null;
        const m = String(it.bundleType).match(/(\d+)/);
        const bundleQty = m ? parseInt(m[1], 10) : 0;
        if (!bundleQty) {
          return NextResponse.json({ error: `Invalid bundle label for "${it.productName || it.name}"` }, { status: 400 });
        }
        if (!cs || cs.length === 0) {
          return NextResponse.json({ error: `Bundle item "${it.productName || it.name}" requires colour selections` }, { status: 400 });
        }
        const sum = cs.reduce((s: number, c: any) => s + (Number(c.quantity) || 0), 0);
        if (sum !== bundleQty) {
          return NextResponse.json({ error: `Bundle quantity mismatch for "${it.productName || it.name}": selected ${sum} of ${bundleQty}` }, { status: 400 });
        }
      }
    }

    const maxRows = await db.execute(
      sql`SELECT COALESCE(MAX(CAST(SUBSTRING(order_id FROM 5) AS INTEGER)), 10000) AS "maxNum" FROM orders WHERE order_id ~ '^ZAY-[0-9]+$'`
    ) as unknown as Array<{ maxNum: number }>;
    const nextNum = Math.max(10001, Number(maxRows[0]?.maxNum ?? 10000) + 1);
    const orderId = `ZAY-${nextNum}`;

    const nowIso = new Date().toISOString();
    const [newOrder] = await db
      .insert(orders)
      .values({
        orderId,
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        shippingAddress: shippingAddress || null,
        totalAmount: String(totalAmount),
        paymentMethod: "Razorpay",
        paymentStatus: "paid",
        orderStatus: "processing",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        couponCode: couponCode || null,
        discountAmount: discountAmount ? String(discountAmount) : null,
        createdAt: nowIso,
        updatedAt: nowIso,
      })
      .returning();

    const orderItemValues = items.map((item: any) => ({
      orderId: newOrder.id,
      productName: item.productName || item.name || item.title,
      productHandle: item.productHandle || item.handle || null,
      quantity: item.quantity,
      price: String(item.price),
      image: item.image || null,
      colorSelections: item.colorSelections && Array.isArray(item.colorSelections) && item.colorSelections.length > 0
        ? JSON.stringify(item.colorSelections)
        : null,
      selectedColor: item.selectedColor && typeof item.selectedColor === "object"
        ? JSON.stringify(item.selectedColor)
        : (typeof item.selectedColor === "string" && item.selectedColor.trim() ? item.selectedColor : null),
      selectedSize: item.selectedSize || null,
      bundleType: item.bundleType || null,
    }));

    for (const it of orderItemValues) console.log("ORDER ITEM DEBUG:", it);
    await db.insert(orderItems).values(orderItemValues);

    if (couponCode) {
      await db.execute(
        sql`UPDATE coupons SET current_usage = current_usage + 1 WHERE code = ${couponCode}`
      );
    }

    console.log("Order created (Razorpay):", orderId);
    console.log("Attempting to send email...");

    await sendOrderConfirmationEmail({
      id: newOrder.id,
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      totalAmount: String(totalAmount),
      paymentMethod: "Razorpay",
      paymentStatus: "paid",
      items: items.map((item: any) => ({
        productName: item.productName || item.name || item.title,
        quantity: item.quantity,
        price: String(item.price),
        image: item.image || null,
        colorSelections: item.colorSelections && Array.isArray(item.colorSelections) && item.colorSelections.length > 0
          ? JSON.stringify(item.colorSelections) : null,
        selectedColor: item.selectedColor && typeof item.selectedColor === "object" ? JSON.stringify(item.selectedColor)
          : (typeof item.selectedColor === "string" && item.selectedColor.trim() ? item.selectedColor : null),
        selectedSize: item.selectedSize || null,
        bundleType: item.bundleType || null,
      })),
      couponCode,
      discountAmount: discountAmount ? String(discountAmount) : null,
    });

    await sendNewOrderNotificationEmail({
      id: newOrder.id,
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      totalAmount: String(totalAmount),
      paymentMethod: "Razorpay",
      paymentStatus: "paid",
      items: items.map((item: any) => ({
        productName: item.productName || item.name || item.title,
        quantity: item.quantity,
        price: String(item.price),
        image: item.image || null,
        colorSelections: item.colorSelections && Array.isArray(item.colorSelections) && item.colorSelections.length > 0
          ? JSON.stringify(item.colorSelections) : null,
        selectedColor: item.selectedColor && typeof item.selectedColor === "object" ? JSON.stringify(item.selectedColor)
          : (typeof item.selectedColor === "string" && item.selectedColor.trim() ? item.selectedColor : null),
        selectedSize: item.selectedSize || null,
        bundleType: item.bundleType || null,
      })),
      couponCode,
      discountAmount: discountAmount ? String(discountAmount) : null,
    });

    return NextResponse.json({ order: newOrder }, { status: 201 });
  } catch (error) {
    console.error("Razorpay verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
