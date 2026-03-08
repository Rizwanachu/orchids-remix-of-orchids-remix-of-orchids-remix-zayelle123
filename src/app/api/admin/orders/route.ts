import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { orders, orderItems } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { eq, desc, and, gte, lte, or, like, sql, SQL } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const paymentStatus = searchParams.get("paymentStatus");
    const orderStatus = searchParams.get("orderStatus");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];

    if (paymentStatus) {
      conditions.push(eq(orders.paymentStatus, paymentStatus as any));
    }
    if (orderStatus) {
      conditions.push(eq(orders.orderStatus, orderStatus as any));
    }
    if (dateFrom) {
      conditions.push(gte(orders.createdAt, new Date(dateFrom).toISOString()));
    }
    if (dateTo) {
      conditions.push(lte(orders.createdAt, new Date(dateTo).toISOString()));
    }
    if (search) {
      conditions.push(
        or(
          like(orders.customerName, `%${search}%`),
          like(orders.customerEmail, `%${search}%`),
          like(orders.orderId, `%${search}%`)
        )!
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [ordersList, countResult] = await Promise.all([
      db
        .select()
        .from(orders)
        .where(whereClause)
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(orders)
        .where(whereClause),
    ]);

    const orderIds = ordersList.map((o) => o.id);
    let items: any[] = [];
    if (orderIds.length > 0) {
      items = await db
        .select()
        .from(orderItems)
        .where(sql`${orderItems.orderId} IN (${sql.join(orderIds.map(id => sql`${id}`), sql`, `)})`);
    }

    const ordersWithItems = ordersList.map((order) => ({
      ...order,
      items: items.filter((item) => item.orderId === order.id),
    }));

    return NextResponse.json({
      orders: ordersWithItems,
      total: countResult[0]?.count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
