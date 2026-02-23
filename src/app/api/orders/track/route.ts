import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { orders, orderItems } from "@/../shared/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, email } = body;

    if (!orderId || !email) {
      return NextResponse.json({ error: "Order number and email are required" }, { status: 400 });
    }

    const [order] = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.orderId, orderId.trim().toUpperCase()),
          eq(orders.customerEmail, email.trim().toLowerCase())
        )
      );

    if (!order) {
      return NextResponse.json({ error: "No order found" }, { status: 404 });
    }

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    return NextResponse.json({
      orderId: order.orderId,
      status: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      items: items.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        price: parseFloat(item.price),
        image: item.image,
      })),
    });
  } catch (error) {
    console.error("Error tracking order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
