import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/../server/db";
import { orders, orderItems } from "@/../shared/schema";
import { desc, sql } from "drizzle-orm";
import { sendOrderConfirmationEmail } from "@/lib/email";

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

    const [lastOrder] = await db
      .select({ orderId: orders.orderId })
      .from(orders)
      .orderBy(desc(orders.id))
      .limit(1);

    let nextNum = 10001;
    if (lastOrder?.orderId) {
      const match = lastOrder.orderId.match(/ZAY-(\d+)/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }
    const orderId = `ZAY-${nextNum}`;

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
      })
      .returning();

    const orderItemValues = items.map((item: any) => ({
      orderId: newOrder.id,
      productName: item.productName || item.name || item.title,
      productHandle: item.productHandle || item.handle || null,
      quantity: item.quantity,
      price: String(item.price),
      image: item.image || null,
    }));

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
