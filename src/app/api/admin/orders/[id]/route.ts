import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { orders, orderItems } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";
import { sendShippingNotificationEmail } from "@/lib/email";
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
    const body = await request.json();
    const { orderStatus, paymentStatus, trackingNumber, trackingCarrier } = body;

    const [existing] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const updateFields: any = { updatedAt: new Date() };
    if (orderStatus) updateFields.orderStatus = orderStatus;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined) updateFields.trackingNumber = trackingNumber || null;
    if (trackingCarrier !== undefined) updateFields.trackingCarrier = trackingCarrier || null;

    const [updated] = await db
      .update(orders)
      .set(updateFields)
      .where(eq(orders.id, orderId))
      .returning();

    if (orderStatus === "shipped" && existing.orderStatus !== "shipped") {
      sendShippingNotificationEmail({
        orderId: existing.orderId,
        customerName: existing.customerName,
        customerEmail: existing.customerEmail,
        trackingNumber: updated.trackingNumber,
        trackingCarrier: updated.trackingCarrier,
      }).catch(() => {});
    }

    const changes: string[] = [];
    if (orderStatus && orderStatus !== existing.orderStatus) {
      changes.push(`order status: ${existing.orderStatus} → ${orderStatus}`);
    }
    if (paymentStatus && paymentStatus !== existing.paymentStatus) {
      changes.push(`payment status: ${existing.paymentStatus} → ${paymentStatus}`);
    }
    if (trackingNumber !== undefined && trackingNumber !== existing.trackingNumber) {
      changes.push(`tracking number: ${trackingNumber || "removed"}`);
    }
    if (trackingCarrier !== undefined && trackingCarrier !== existing.trackingCarrier) {
      changes.push(`tracking carrier: ${trackingCarrier || "removed"}`);
    }

    await logAdminActivity(
      admin.id,
      admin.email,
      "order_status_update",
      `Order ${existing.orderId}: ${changes.join(", ")}`
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
