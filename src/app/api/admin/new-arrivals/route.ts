import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { newArrivals, products } from "@/../shared/schema";
import { eq, asc } from "drizzle-orm";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await db
    .select()
    .from(newArrivals)
    .innerJoin(products, eq(newArrivals.productId, products.id))
    .orderBy(asc(newArrivals.displayOrder));

  const formatted = results.map((r) => ({
    id: r.new_arrivals.id,
    productId: r.new_arrivals.productId,
    displayOrder: r.new_arrivals.displayOrder,
    createdAt: r.new_arrivals.createdAt,
    product: {
      id: r.products.id,
      handle: r.products.handle,
      name: r.products.name,
      subtitle: r.products.subtitle,
      price: parseFloat(r.products.price),
      compareAt: r.products.compareAt ? parseFloat(r.products.compareAt) : undefined,
      image: r.products.image,
      hoverImage: r.products.hoverImage || r.products.image,
      badge: r.products.badge || undefined,
      category: r.products.category,
    },
  }));

  return NextResponse.json(formatted);
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const [created] = await db
      .insert(newArrivals)
      .values({
        productId: body.productId,
        displayOrder: body.displayOrder ?? 0,
      })
      .returning();

    await logAdminActivity(admin.id, admin.email, "new_arrival_added", `Added product #${body.productId} to new arrivals`);

    return NextResponse.json(created);
  } catch (error: any) {
    console.error("Error adding new arrival:", error);
    return NextResponse.json({ error: error.message || "Failed to add new arrival" }, { status: 500 });
  }
}
