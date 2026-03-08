import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { orders, users } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { sql, desc, eq, ne } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const allOrders = await db
      .select({
        customerName: orders.customerName,
        customerEmail: orders.customerEmail,
        customerPhone: orders.customerPhone,
        totalAmount: orders.totalAmount,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .orderBy(desc(orders.createdAt));

    const registeredUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        address: users.address,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(ne(users.role, "admin"));

    const registeredMap = new Map<string, { id: number; name: string; phone: string | null; address: string | null; createdAt: Date }>();
    for (const u of registeredUsers) {
      registeredMap.set(u.email, { id: u.id, name: u.name, phone: u.phone, address: u.address, createdAt: u.createdAt });
    }

    const customerMap = new Map<string, {
      userId: number | null;
      name: string;
      email: string;
      phone: string | null;
      address: string | null;
      totalOrders: number;
      totalSpend: number;
      lastOrderDate: Date | null;
      firstOrderDate: Date | null;
      hasAccount: boolean;
    }>();

    for (const order of allOrders) {
      const email = order.customerEmail;
      const existing = customerMap.get(email);
      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpend += parseFloat(order.totalAmount);
        if (!existing.lastOrderDate || order.createdAt > existing.lastOrderDate) {
          existing.lastOrderDate = order.createdAt;
        }
      } else {
        const registered = registeredMap.get(email);
        customerMap.set(email, {
          userId: registered?.id || null,
          name: registered?.name || order.customerName,
          email,
          phone: registered?.phone || order.customerPhone,
          address: registered?.address || null,
          totalOrders: 1,
          totalSpend: parseFloat(order.totalAmount),
          lastOrderDate: order.createdAt,
          firstOrderDate: order.createdAt,
          hasAccount: !!registered,
        });
      }
    }

    for (const [email, regUser] of registeredMap) {
      if (!customerMap.has(email)) {
        customerMap.set(email, {
          userId: regUser.id,
          name: regUser.name,
          email,
          phone: regUser.phone,
          address: regUser.address,
          totalOrders: 0,
          totalSpend: 0,
          lastOrderDate: null,
          firstOrderDate: null,
          hasAccount: true,
        });
      }
    }

    let customersList = Array.from(customerMap.values());

    if (search) {
      const q = search.toLowerCase();
      customersList = customersList.filter(
        (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
      );
    }

    customersList.sort((a, b) => {
      const dateA = a.lastOrderDate ? new Date(a.lastOrderDate).getTime() : 0;
      const dateB = b.lastOrderDate ? new Date(b.lastOrderDate).getTime() : 0;
      return dateB - dateA;
    });

    const total = customersList.length;
    const paginated = customersList.slice(offset, offset + limit);

    return NextResponse.json({
      customers: paginated.map((c) => ({
        ...c,
        totalSpend: c.totalSpend.toFixed(2),
        createdAt: c.lastOrderDate || c.firstOrderDate || new Date().toISOString(),
        lastOrderDate: c.lastOrderDate ? String(c.lastOrderDate) : null,
      })),
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
