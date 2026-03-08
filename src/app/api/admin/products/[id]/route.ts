import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { products, newArrivals, reviews } from "@/../shared/schema";
import { eq } from "drizzle-orm";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
    if (body.handle !== undefined) updateData.handle = body.handle;
    if (body.price !== undefined) updateData.price = String(body.price);
    if (body.compareAt !== undefined) updateData.compareAt = body.compareAt != null && body.compareAt !== "" ? String(body.compareAt) : null;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.hoverImage !== undefined) updateData.hoverImage = body.hoverImage;
    if (body.badge !== undefined) updateData.badge = body.badge || null;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.details !== undefined) updateData.details = body.details;
    if (body.dimension !== undefined) updateData.dimension = body.dimension;
    if (body.material !== undefined) updateData.material = body.material;
    if (body.careInstructions !== undefined) updateData.careInstructions = body.careInstructions;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.stockQuantity !== undefined) updateData.stockQuantity = body.stockQuantity;
    if (body.lowStockThreshold !== undefined) updateData.lowStockThreshold = body.lowStockThreshold;
    if (body.shippingCost !== undefined) updateData.shippingCost = String(body.shippingCost);
    if (body.shippingCostKerala !== undefined) updateData.shippingCostKerala = String(body.shippingCostKerala);
    if (body.isFreeShipping !== undefined) updateData.isFreeShipping = body.isFreeShipping ? 1 : 0;
    if (body.colors !== undefined) updateData.colors = Array.isArray(body.colors) ? JSON.stringify(body.colors) : null;
    if (body.gallery !== undefined) updateData.gallery = Array.isArray(body.gallery) ? JSON.stringify(body.gallery) : null;
    if (body.active !== undefined) updateData.active = body.active ? 1 : 0;

    const [updated] = await db.update(products).set(updateData).where(eq(products.id, parseInt(id))).returning();

    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await logAdminActivity(admin.id, admin.email, "product_updated", `Updated product: ${updated.name}`);

    return NextResponse.json({
      id: updated.id.toString(),
      handle: updated.handle,
      name: updated.name,
      subtitle: updated.subtitle,
      price: Number(updated.price),
      compareAt: updated.compareAt ? Number(updated.compareAt) : undefined,
      image: updated.image,
      hoverImage: updated.hoverImage,
      badge: updated.badge || undefined,
      description: updated.description,
      details: updated.details || [],
      dimension: updated.dimension || "",
      material: updated.material || "",
      careInstructions: updated.careInstructions || "",
      category: updated.category,
      stockQuantity: updated.stockQuantity,
      lowStockThreshold: updated.lowStockThreshold,
      shippingCost: Number(updated.shippingCost),
      shippingCostKerala: Number(updated.shippingCostKerala),
      isFreeShipping: updated.isFreeShipping,
      colors: (() => { try { return updated.colors ? (typeof updated.colors === 'string' ? JSON.parse(updated.colors) : updated.colors) : []; } catch { return []; } })(),
      gallery: (() => { try { return updated.gallery ? (typeof updated.gallery === 'string' ? JSON.parse(updated.gallery) : updated.gallery) : []; } catch { return []; } })(),
    });
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const productId = parseInt(id);
    await db.delete(newArrivals).where(eq(newArrivals.productId, productId));
    await db.delete(reviews).where(eq(reviews.productId, productId));
    const [deleted] = await db.delete(products).where(eq(products.id, productId)).returning();

    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await logAdminActivity(admin.id, admin.email, "product_deleted", `Deleted product: ${deleted.name}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: error.message || "Failed to delete product" }, { status: 500 });
  }
}
