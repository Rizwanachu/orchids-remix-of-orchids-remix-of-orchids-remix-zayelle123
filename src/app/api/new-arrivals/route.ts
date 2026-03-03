import { NextResponse } from "next/server";
import { db } from "@/../server/db";
import { newArrivals, products } from "@/../shared/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const results = await db
      .select()
      .from(newArrivals)
      .innerJoin(products, eq(newArrivals.productId, products.id))
      .orderBy(asc(newArrivals.displayOrder))
      .limit(8);

    const formatted = results.map((r) => ({
      id: r.products.id.toString(),
      handle: r.products.handle,
      name: r.products.name,
      subtitle: r.products.subtitle,
      price: parseFloat(r.products.price),
      compareAt: r.products.compareAt ? parseFloat(r.products.compareAt) : undefined,
      image: r.products.image,
      hoverImage: r.products.hoverImage || r.products.image,
      badge: r.products.badge || undefined,
      description: r.products.description,
      details: r.products.details || [],
      shippingPolicy: r.products.shippingPolicy || "",
      returnPolicy: r.products.returnPolicy || "",
      category: r.products.category,
      shippingCost: Number(r.products.shippingCost),
      isFreeShipping: r.products.isFreeShipping,
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("Error fetching new arrivals:", error);
    return NextResponse.json([], { status: 200 });
  }
}
