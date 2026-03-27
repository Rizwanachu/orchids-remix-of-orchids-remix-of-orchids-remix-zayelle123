import { NextResponse } from "next/server";
import { db } from "@/../server/db";
import { newArrivals, products } from "@/../shared/schema";
import { eq, asc } from "drizzle-orm";

function getColorInfo(productColors: string | null, colorSlug: string | null | undefined) {
  if (!colorSlug || !productColors) return null;
  const colors: { name: string; hex: string; image?: string; images?: string[] }[] = (() => {
    try { return JSON.parse(productColors); } catch { return []; }
  })();
  return colors.find((c) =>
    c.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") === colorSlug
  ) || null;
}

export async function GET() {
  try {
    const results = await db
      .select()
      .from(newArrivals)
      .innerJoin(products, eq(newArrivals.productId, products.id))
      .orderBy(asc(newArrivals.displayOrder));

    const formatted = results.map((r) => {
      const colorInfo = getColorInfo(r.products.colors, r.new_arrivals.colorSlug);
      const colorImage = colorInfo ? ((colorInfo.images?.[0] ?? colorInfo.image) || r.products.image) : r.products.image;
      const colorHoverImage = colorInfo?.images?.[1] || r.products.hoverImage || r.products.image;
      const colorSlug = r.new_arrivals.colorSlug;
      return {
        id: r.products.id.toString() + (colorSlug ? `-${colorSlug}` : ""),
        handle: r.products.handle,
        colorSlug: colorSlug || null,
        colorName: colorInfo?.name || null,
        name: colorInfo ? `${r.products.name} — ${colorInfo.name}` : r.products.name,
        subtitle: r.products.subtitle,
        price: parseFloat(r.products.price),
        compareAt: r.products.compareAt ? parseFloat(r.products.compareAt) : undefined,
        image: colorImage,
        hoverImage: colorHoverImage,
        badge: r.products.badge || undefined,
        description: r.products.description,
        details: r.products.details || [],
        shippingPolicy: r.products.shippingPolicy || "",
        returnPolicy: r.products.returnPolicy || "",
        category: r.products.category,
        shippingCost: Number(r.products.shippingCost),
        isFreeShipping: r.products.isFreeShipping,
      };
    });

    return NextResponse.json(formatted, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "CDN-Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        "Vercel-CDN-Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    });
  } catch (error: any) {
    console.error("Error fetching new arrivals:", error);
    return NextResponse.json([], { status: 200 });
  }
}
