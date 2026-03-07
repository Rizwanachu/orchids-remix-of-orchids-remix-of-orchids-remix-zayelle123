import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { orders, orderItems } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { eq, sql, gte, lte, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const dateConditions = [];
    dateConditions.push(eq(orders.paymentStatus, "paid"));
    if (dateFrom) {
      dateConditions.push(gte(orders.createdAt, dateFrom));
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      dateConditions.push(lte(orders.createdAt, toDate.toISOString()));
    }

    const summaryWhere = and(...dateConditions);

    const [summaryResult] = await db
      .select({
        totalRevenue: sql<string>`COALESCE(SUM(${orders.totalAmount}::numeric), 0)`,
        totalOrders: sql<number>`COUNT(*)::int`,
        averageOrderValue: sql<string>`COALESCE(AVG(${orders.totalAmount}::numeric), 0)`,
      })
      .from(orders)
      .where(summaryWhere);

    const dateFilterConditions = [];
    if (dateFrom) {
      dateFilterConditions.push(gte(orders.createdAt, dateFrom));
    } else {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      dateFilterConditions.push(gte(orders.createdAt, sevenDaysAgo.toISOString()));
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      dateFilterConditions.push(lte(orders.createdAt, toDate.toISOString()));
    }

    const dailyWhere = dateFilterConditions.length > 0 ? and(...dateFilterConditions) : undefined;

    const dailySales = await db
      .select({
        date: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`,
        revenue: sql<string>`COALESCE(SUM(${orders.totalAmount}::numeric), 0)`,
        orders: sql<number>`COUNT(*)::int`,
      })
      .from(orders)
      .where(dailyWhere)
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`);

    const monthlyFilterConditions = [];
    if (dateFrom) {
      monthlyFilterConditions.push(gte(orders.createdAt, dateFrom));
    } else {
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      monthlyFilterConditions.push(gte(orders.createdAt, twelveMonthsAgo.toISOString()));
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      monthlyFilterConditions.push(lte(orders.createdAt, toDate.toISOString()));
    }

    const monthlyWhere = monthlyFilterConditions.length > 0 ? and(...monthlyFilterConditions) : undefined;

    const monthlySales = await db
      .select({
        month: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
        revenue: sql<string>`COALESCE(SUM(${orders.totalAmount}::numeric), 0)`,
        orders: sql<number>`COUNT(*)::int`,
      })
      .from(orders)
      .where(monthlyWhere)
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`);

    const orderItemConditions = [];
    if (dateFrom || dateTo) {
      const subquery = db
        .select({ id: orders.id })
        .from(orders)
        .where(and(...dateConditions));

      const filteredOrderItems = await db
        .select({
          productName: orderItems.productName,
          totalQuantity: sql<number>`SUM(${orderItems.quantity})::int`,
          totalRevenue: sql<string>`SUM(${orderItems.price}::numeric * ${orderItems.quantity})`,
        })
        .from(orderItems)
        .where(sql`${orderItems.orderId} IN (${subquery})`)
        .groupBy(orderItems.productName)
        .orderBy(sql`SUM(${orderItems.quantity}) DESC`)
        .limit(5);

      return NextResponse.json({
        totalRevenue: parseFloat(summaryResult.totalRevenue) || 0,
        totalOrders: summaryResult.totalOrders || 0,
        averageOrderValue: parseFloat(summaryResult.averageOrderValue) || 0,
        dailySales,
        monthlySales,
        bestSellingProducts: filteredOrderItems,
        lowStockAlert: 0,
      });
    }

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
