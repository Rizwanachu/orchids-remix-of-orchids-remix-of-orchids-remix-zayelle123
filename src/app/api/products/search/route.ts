import { NextResponse } from "next/server";
import { db } from "@/../server/db";
import { products } from "@/../shared/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        handle: products.handle,
        price: products.price,
        image: products.image,
      })
      .from(products)
      .where(eq(products.active, 1));

    const formatted = rows.map((p) => ({
      id: p.id.toString(),
      name: p.name,
      handle: p.handle,
      price: Number(p.price),
      image: p.image,
    }));

    return NextResponse.json(formatted, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
        "CDN-Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
        "Vercel-CDN-Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("Error fetching search products:", error);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}
