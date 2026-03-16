import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { products } from "@/../shared/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allProducts = await db.select().from(products).where(eq(products.active, 1));
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
      details: (() => {
        if (!p.details) return [];
        const byNewline = p.details.split("\n").map((d: string) => d.trim()).filter(Boolean);
        if (byNewline.length > 1) return byNewline;
        const byComma = p.details.split(/,(?=[A-Z])/).map((d: string) => d.trim()).filter(Boolean);
        if (byComma.length > 1) return byComma;
        return byNewline;
      })(),
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
      colorSwatchStyle: p.colorSwatchStyle || "pills",
      sizes: (() => { try { return p.sizes ? (typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes) : []; } catch { return []; } })(),
      gallery: (() => { try { return p.gallery ? (typeof p.gallery === 'string' ? JSON.parse(p.gallery) : p.gallery) : []; } catch { return []; } })(),
      customHamperEnabled: p.customHamperEnabled ?? 0,
      customHamperTitle: p.customHamperTitle || "",
      customHamperBody: p.customHamperBody || "",
      customHamperInstagram: p.customHamperInstagram || "",
      customHamperContact: p.customHamperContact || "",
    }));
    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}
