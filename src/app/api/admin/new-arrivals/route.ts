import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { db } from "@/../server/db";
import { newArrivals, products } from "@/../shared/schema";
import { eq, asc } from "drizzle-orm";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";

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
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await db
    .select()
    .from(newArrivals)
    .innerJoin(products, eq(newArrivals.productId, products.id))
    .orderBy(asc(newArrivals.displayOrder));

  const formatted = results.map((r) => {
    const colorInfo = getColorInfo(r.products.colors, r.new_arrivals.colorSlug);
    const colorImage = colorInfo ? ((colorInfo.images?.[0] ?? colorInfo.image) || r.products.image) : r.products.image;
    return {
      id: r.new_arrivals.id,
      productId: r.new_arrivals.productId,
      colorSlug: r.new_arrivals.colorSlug || null,
      colorName: colorInfo?.name || null,
      colorHex: colorInfo?.hex || null,
      displayOrder: r.new_arrivals.displayOrder,
      createdAt: r.new_arrivals.createdAt,
      product: {
        id: r.products.id,
        handle: r.products.handle,
        name: r.products.name,
        subtitle: r.products.subtitle,
        price: parseFloat(r.products.price),
        compareAt: r.products.compareAt ? parseFloat(r.products.compareAt) : undefined,
        image: colorImage,
        hoverImage: r.products.hoverImage || r.products.image,
        badge: r.products.badge || undefined,
        category: r.products.category,
      },
    };
  });

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
        colorSlug: body.colorSlug || null,
        displayOrder: body.displayOrder ?? 0,
      })
      .returning();

    await logAdminActivity(admin.id, admin.email, "new_arrival_added", `Added product #${body.productId}${body.colorSlug ? ` (${body.colorSlug})` : ""} to new arrivals`);
    revalidateTag("new-arrivals");

    return NextResponse.json(created);
  } catch (error: any) {
    console.error("Error adding new arrival:", error);
    return NextResponse.json({ error: error.message || "Failed to add new arrival" }, { status: 500 });
  }
}
