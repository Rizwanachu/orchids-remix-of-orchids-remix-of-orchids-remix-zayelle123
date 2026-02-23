import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { orders, orderItems } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const orderId = parseInt(id);

    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

    return NextResponse.json({ ...order, items });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const orderId = parseInt(id);
    const { orderStatus } = await request.json();

    const [existing] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const [updated] = await db
      .update(orders)
      .set({ orderStatus, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();

    await logAdminActivity(
      admin.id,
      admin.email,
      "order_status_update",
      `Order ${existing.orderId} status changed from ${existing.orderStatus} to ${orderStatus}`
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
