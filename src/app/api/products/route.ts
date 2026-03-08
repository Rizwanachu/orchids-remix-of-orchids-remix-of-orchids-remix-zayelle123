import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { products } from "@/../shared/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allProducts = await db.select().from(products).where(eq(products.active, true));
    const formatted = allProducts.map((p) => ({
      id: p.id.toString(),
      handle: p.handle,
      name: p.name,
      subtitle: p.subtitle,
      price: Number(p.price),
      compareAt: p.compareAt ? Number(p.compareAt) : undefined,
      image: p.image,
      hoverImage: p.hoverImage || p.image,
      badge: p.badge || undefined,
      description: p.description,
      details: p.details || [],
      dimension: p.dimension || "",
      material: p.material || "",
      careInstructions: p.careInstructions || "",
      shippingPolicy: p.shippingPolicy || "",
      returnPolicy: p.returnPolicy || "",
      category: p.category,
      stockQuantity: p.stockQuantity,
      lowStockThreshold: p.lowStockThreshold,
      shippingCost: Number(p.shippingCost),
      shippingCostKerala: Number(p.shippingCostKerala),
      isFreeShipping: p.isFreeShipping,
      colors: (() => { try { return p.colors ? (typeof p.colors === 'string' ? JSON.parse(p.colors) : p.colors) : []; } catch { return []; } })(),
      gallery: (() => { try { return p.gallery ? (typeof p.gallery === 'string' ? JSON.parse(p.gallery) : p.gallery) : []; } catch { return []; } })(),
    }));
    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}
