import { NextResponse } from "next/server";
import { db } from "@/../server/db";
import { orders, orderItems } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { eq, sql, gte } from "drizzle-orm";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [summaryResult] = await db
      .select({
        totalRevenue: sql<string>`COALESCE(SUM(${orders.totalAmount}::numeric), 0)`,
        totalOrders: sql<number>`COUNT(*)::int`,
        averageOrderValue: sql<string>`COALESCE(AVG(${orders.totalAmount}::numeric), 0)`,
      })
      .from(orders)
      .where(eq(orders.paymentStatus, "paid"));

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailySales = await db
      .select({
        date: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`,
        revenue: sql<string>`COALESCE(SUM(${orders.totalAmount}::numeric), 0)`,
        orders: sql<number>`COUNT(*)::int`,
      })
      .from(orders)
      .where(gte(orders.createdAt, sevenDaysAgo))
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`);

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlySales = await db
      .select({
        month: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
        revenue: sql<string>`COALESCE(SUM(${orders.totalAmount}::numeric), 0)`,
        orders: sql<number>`COUNT(*)::int`,
      })
      .from(orders)
      .where(gte(orders.createdAt, twelveMonthsAgo))
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`);

    const bestSellingProducts = await db
      .select({
        productName: orderItems.productName,
        totalQuantity: sql<number>`SUM(${orderItems.quantity})::int`,
        totalRevenue: sql<string>`SUM(${orderItems.price}::numeric * ${orderItems.quantity})`,
      })
      .from(orderItems)
      .groupBy(orderItems.productName)
      .orderBy(sql`SUM(${orderItems.quantity}) DESC`)
      .limit(5);

    return NextResponse.json({
      totalRevenue: parseFloat(summaryResult.totalRevenue) || 0,
      totalOrders: summaryResult.totalOrders || 0,
      averageOrderValue: parseFloat(summaryResult.averageOrderValue) || 0,
      dailySales,
      monthlySales,
      bestSellingProducts,
      lowStockAlert: 0,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
