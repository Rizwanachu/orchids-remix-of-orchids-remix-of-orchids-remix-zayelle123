import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { orders, orderItems } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { eq, desc, and, gte, lte, or, like, sql, SQL } from "drizzle-orm";

function escapeCsvField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

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

    const conditions: SQL[] = [];

    if (paymentStatus) conditions.push(eq(orders.paymentStatus, paymentStatus as any));
    if (orderStatus) conditions.push(eq(orders.orderStatus, orderStatus as any));
    if (dateFrom) conditions.push(gte(orders.createdAt, new Date(dateFrom)));
    if (dateTo) conditions.push(lte(orders.createdAt, new Date(dateTo)));
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

    const ordersList = await db
      .select()
      .from(orders)
      .where(whereClause)
      .orderBy(desc(orders.createdAt));

    const allItems = ordersList.length > 0
      ? await db
          .select()
          .from(orderItems)
          .where(sql`${orderItems.orderId} IN (${sql.join(ordersList.map(o => sql`${o.id}`), sql`, `)})`)
      : [];

    const headers = ["Order ID", "Customer Name", "Phone", "Email", "Products", "Total", "Status", "Payment Status", "Payment Method", "Date"];
    const csvRows = [headers.map(escapeCsvField).join(",")];

    for (const order of ordersList) {
      const items = allItems.filter((item) => item.orderId === order.id);
      const products = items.map((i) => `${i.productName} x${i.quantity}`).join("; ");
      const row = [
        order.orderId,
        order.customerName,
        order.customerPhone || "",
        order.customerEmail,
        products,
        order.totalAmount,
        order.orderStatus,
        order.paymentStatus,
        order.paymentMethod || "",
        new Date(order.createdAt).toISOString().split("T")[0],
      ];
      csvRows.push(row.map((f) => escapeCsvField(String(f))).join(","));
    }

    const csv = csvRows.join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="orders-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting orders:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
