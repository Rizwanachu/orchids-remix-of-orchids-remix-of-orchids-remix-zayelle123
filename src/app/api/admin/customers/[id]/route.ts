import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { users, orders, orderItems } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const userId = parseInt(id);

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.customerEmail, user.email))
      .orderBy(orders.createdAt);

    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
        return { ...order, items };
      })
    );

    return NextResponse.json({ user, orders: ordersWithItems });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const userId = parseInt(id);
    const body = await request.json();
    const { name, phone, address } = body;

    const [existing] = await db.select().from(users).where(eq(users.id, userId));
    if (!existing) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    const updateFields: Record<string, string | null> = {};
    if (name !== undefined) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone || null;
    if (address !== undefined) updateFields.address = address || null;

    const [updated] = await db
      .update(users)
      .set(updateFields)
      .where(eq(users.id, userId))
      .returning();

    await logAdminActivity(
      admin.id,
      admin.email,
      "customer_update",
      `Updated customer ${existing.email}: ${Object.keys(updateFields).join(", ")}`
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const userId = parseInt(id);

    const [existing] = await db.select().from(users).where(eq(users.id, userId));
    if (!existing) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    if (existing.role === "admin") {
      return NextResponse.json({ error: "Cannot delete admin accounts" }, { status: 403 });
    }

    await db.delete(users).where(eq(users.id, userId));

    await logAdminActivity(
      admin.id,
      admin.email,
      "customer_delete",
      `Deleted customer account: ${existing.email} (${existing.name})`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
