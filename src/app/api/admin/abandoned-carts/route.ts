import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { abandonedCarts } from "@/../shared/schema";
import { eq, desc } from "drizzle-orm";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const all = await db.select().from(abandonedCarts).orderBy(desc(abandonedCarts.id));
    const filtered = status && status !== "all" ? all.filter(c => c.status === status) : all;

    return NextResponse.json({
      carts: filtered.map(c => ({
        ...c,
        products: (() => { try { return JSON.parse(c.products); } catch { return []; } })(),
        cartValue: Number(c.cartValue),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const [cart] = await db.insert(abandonedCarts).values({
      customerName: body.customerName || "",
      phone: body.phone || "",
      email: body.email || "",
      products: JSON.stringify(body.products || []),
      cartValue: String(body.cartValue || 0),
      status: "pending",
      notes: "",
      createdAt: new Date().toISOString(),
    }).returning();
    return NextResponse.json(cart, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
