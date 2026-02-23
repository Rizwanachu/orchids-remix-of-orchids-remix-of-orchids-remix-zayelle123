import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { products } from "@/../shared/schema";
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
    if (body.price !== undefined) updateData.price = body.price.toString();
    if (body.compareAt !== undefined) updateData.compareAt = body.compareAt ? body.compareAt.toString() : null;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.hoverImage !== undefined) updateData.hoverImage = body.hoverImage;
    if (body.badge !== undefined) updateData.badge = body.badge || null;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.details !== undefined) updateData.details = body.details;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.stockQuantity !== undefined) updateData.stockQuantity = body.stockQuantity;
    if (body.lowStockThreshold !== undefined) updateData.lowStockThreshold = body.lowStockThreshold;
    if (body.active !== undefined) updateData.active = body.active;

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
      price: parseFloat(updated.price),
      compareAt: updated.compareAt ? parseFloat(updated.compareAt) : undefined,
      image: updated.image,
      hoverImage: updated.hoverImage,
      badge: updated.badge || undefined,
      description: updated.description,
      details: updated.details || [],
      category: updated.category,
      stockQuantity: updated.stockQuantity,
      lowStockThreshold: updated.lowStockThreshold,
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
    const [deleted] = await db.delete(products).where(eq(products.id, parseInt(id))).returning();

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
