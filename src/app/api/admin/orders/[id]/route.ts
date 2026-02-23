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
    const { orderStatus, paymentStatus, trackingNumber, trackingCarrier, customerName, customerEmail, customerPhone, shippingAddress, items: updatedItems } = body;

    const [existing] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const updateFields: any = { updatedAt: new Date() };
    if (orderStatus) updateFields.orderStatus = orderStatus;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined) updateFields.trackingNumber = trackingNumber || null;
    if (trackingCarrier !== undefined) updateFields.trackingCarrier = trackingCarrier || null;
    if (customerName !== undefined) updateFields.customerName = customerName;
    if (customerEmail !== undefined) updateFields.customerEmail = customerEmail;
    if (customerPhone !== undefined) updateFields.customerPhone = customerPhone || null;
    if (shippingAddress !== undefined) updateFields.shippingAddress = shippingAddress || null;

    if (updatedItems && Array.isArray(updatedItems)) {
      const existingItems = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
      const existingItemIds = existingItems.map((i) => i.id);
      const updatedItemIds = updatedItems.map((i: any) => i.id).filter(Boolean);

      const toDelete = existingItemIds.filter((id) => !updatedItemIds.includes(id));
      for (const itemId of toDelete) {
        await db.delete(orderItems).where(eq(orderItems.id, itemId));
      }

      for (const item of updatedItems) {
        if (item.id && existingItemIds.includes(item.id)) {
          await db
            .update(orderItems)
            .set({ quantity: item.quantity, price: item.price })
            .where(eq(orderItems.id, item.id));
        }
      }

      let newTotal = 0;
      const finalItems = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
      for (const fi of finalItems) {
        newTotal += parseFloat(fi.price) * fi.quantity;
      }
      if (existing.discountAmount) {
        newTotal = Math.max(0, newTotal - parseFloat(existing.discountAmount));
      }
      updateFields.totalAmount = newTotal.toFixed(2);
    }

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
    if (customerName !== undefined && customerName !== existing.customerName) {
      changes.push(`customer name: ${existing.customerName} → ${customerName}`);
    }
    if (customerEmail !== undefined && customerEmail !== existing.customerEmail) {
      changes.push(`customer email: ${existing.customerEmail} → ${customerEmail}`);
    }
    if (customerPhone !== undefined && customerPhone !== existing.customerPhone) {
      changes.push(`customer phone updated`);
    }
    if (shippingAddress !== undefined && shippingAddress !== existing.shippingAddress) {
      changes.push(`shipping address updated`);
    }
    if (updatedItems && Array.isArray(updatedItems)) {
      changes.push(`order items updated`);
    }

    await logAdminActivity(
      admin.id,
      admin.email,
      "order_update",
      `Order ${existing.orderId}: ${changes.join(", ")}`
    );

    const finalItemsList = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    return NextResponse.json({ ...updated, items: finalItemsList });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
