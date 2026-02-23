import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { users, orders } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { eq, ne, or, like, sql, and, SQL, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [ne(users.role, "admin")];

    if (search) {
      conditions.push(
        or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`)
        )!
      );
    }

    const whereClause = and(...conditions);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(whereClause);

    const customersList = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        createdAt: users.createdAt,
        totalOrders: sql<number>`COALESCE((SELECT COUNT(*) FROM orders WHERE orders.customer_email = ${users.email})::int, 0)`,
        totalSpend: sql<string>`COALESCE((SELECT SUM(total_amount::numeric) FROM orders WHERE orders.customer_email = ${users.email}), 0)`,
        lastOrderDate: sql<string | null>`(SELECT MAX(created_at) FROM orders WHERE orders.customer_email = ${users.email})`,
      })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      customers: customersList,
      total: countResult?.count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
