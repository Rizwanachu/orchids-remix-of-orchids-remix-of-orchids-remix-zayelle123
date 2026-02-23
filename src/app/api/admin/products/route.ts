import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { products } from "@/../shared/schema";
import { eq } from "drizzle-orm";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allProducts = await db.select().from(products);
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
    shippingPolicy: p.shippingPolicy || "",
    returnPolicy: p.returnPolicy || "",
    category: p.category,
    stockQuantity: p.stockQuantity,
    lowStockThreshold: p.lowStockThreshold,
    active: p.active,
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
    const [newProduct] = await db.insert(products).values({
      handle: body.handle,
      name: body.name,
      subtitle: body.subtitle || "",
      price: String(body.price),
      compareAt: body.compareAt != null && body.compareAt !== "" ? String(body.compareAt) : null,
      image: body.image,
      hoverImage: body.hoverImage || body.image,
      badge: body.badge || null,
      description: body.description || "",
      details: body.details || [],
      shippingPolicy: body.shippingPolicy || "",
      returnPolicy: body.returnPolicy || "",
      category: body.category || "",
      stockQuantity: body.stockQuantity ?? 100,
      lowStockThreshold: body.lowStockThreshold ?? 10,
    }).returning();

    await logAdminActivity(admin.id, admin.email, "product_added", `Added product: ${body.name}`);

    return NextResponse.json({
      id: newProduct.id.toString(),
      handle: newProduct.handle,
      name: newProduct.name,
      subtitle: newProduct.subtitle,
      price: Number(newProduct.price),
      compareAt: newProduct.compareAt ? Number(newProduct.compareAt) : undefined,
      image: newProduct.image,
      hoverImage: newProduct.hoverImage,
      badge: newProduct.badge || undefined,
      description: newProduct.description,
      details: newProduct.details || [],
      shippingPolicy: newProduct.shippingPolicy || "",
      returnPolicy: newProduct.returnPolicy || "",
      category: newProduct.category,
      stockQuantity: newProduct.stockQuantity,
      lowStockThreshold: newProduct.lowStockThreshold,
    });
  } catch (error: any) {
    console.error("Error adding product:", error);
    return NextResponse.json({ error: error.message || "Failed to add product" }, { status: 500 });
  }
}
