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
    if (body.details !== undefined) updateData.details = Array.isArray(body.details) ? body.details.join("\n") : (body.details || "");
    if (body.dimension !== undefined) updateData.dimension = body.dimension;
    if (body.material !== undefined) updateData.material = body.material;
    if (body.careInstructions !== undefined) updateData.careInstructions = body.careInstructions;
    if (body.shippingPolicy !== undefined) updateData.shippingPolicy = body.shippingPolicy || "";
    if (body.returnPolicy !== undefined) updateData.returnPolicy = body.returnPolicy || "";
    if (body.category !== undefined) updateData.category = body.category;
    if (body.stockQuantity !== undefined) updateData.stockQuantity = body.stockQuantity;
    if (body.lowStockThreshold !== undefined) updateData.lowStockThreshold = body.lowStockThreshold;
    if (body.shippingCost !== undefined) updateData.shippingCost = String(body.shippingCost);
    if (body.shippingCostKerala !== undefined) updateData.shippingCostKerala = String(body.shippingCostKerala);
    if (body.isFreeShipping !== undefined) updateData.isFreeShipping = body.isFreeShipping ? 1 : 0;
    if (body.colors !== undefined) updateData.colors = Array.isArray(body.colors) ? JSON.stringify(body.colors) : null;
    if (body.colorSwatchStyle !== undefined) updateData.colorSwatchStyle = body.colorSwatchStyle || "pills";
    if (body.sizes !== undefined) updateData.sizes = Array.isArray(body.sizes) ? JSON.stringify(body.sizes) : null;
    if (body.deliveryCharges !== undefined) updateData.deliveryCharges = body.deliveryCharges ? JSON.stringify(body.deliveryCharges) : null;
    if (body.bundlePricing !== undefined) updateData.bundlePricing = Array.isArray(body.bundlePricing) && body.bundlePricing.length > 0 ? JSON.stringify(body.bundlePricing) : null;
    if (body.gallery !== undefined) updateData.gallery = Array.isArray(body.gallery) ? JSON.stringify(body.gallery) : null;
    if (body.active !== undefined) updateData.active = body.active ? 1 : 0;
    if (body.customHamperEnabled !== undefined) updateData.customHamperEnabled = body.customHamperEnabled ? 1 : 0;
    if (body.customHamperTitle !== undefined) updateData.customHamperTitle = body.customHamperTitle || null;
    if (body.customHamperBody !== undefined) updateData.customHamperBody = body.customHamperBody || null;
    if (body.customHamperInstagram !== undefined) updateData.customHamperInstagram = body.customHamperInstagram || null;
    if (body.customHamperContact !== undefined) updateData.customHamperContact = body.customHamperContact || null;

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
      details: (() => {
        if (!updated.details) return [];
        const byNewline = updated.details.split("\n").map((d: string) => d.trim()).filter(Boolean);
        if (byNewline.length > 1) return byNewline;
        const byComma = updated.details.split(/,(?=[A-Z])/).map((d: string) => d.trim()).filter(Boolean);
        if (byComma.length > 1) return byComma;
        return byNewline;
      })(),
      dimension: updated.dimension || "",
      material: updated.material || "",
      careInstructions: updated.careInstructions || "",
      shippingPolicy: updated.shippingPolicy || "",
      returnPolicy: updated.returnPolicy || "",
      category: updated.category,
      stockQuantity: updated.stockQuantity,
      lowStockThreshold: updated.lowStockThreshold,
      shippingCost: Number(updated.shippingCost),
      shippingCostKerala: Number(updated.shippingCostKerala),
      isFreeShipping: updated.isFreeShipping,
      colors: (() => { try { return updated.colors ? (typeof updated.colors === 'string' ? JSON.parse(updated.colors) : updated.colors) : []; } catch { return []; } })(),
      colorSwatchStyle: updated.colorSwatchStyle || "pills",
      sizes: (() => { try { return updated.sizes ? (typeof updated.sizes === 'string' ? JSON.parse(updated.sizes) : updated.sizes) : []; } catch { return []; } })(),
      deliveryCharges: (() => { try { return updated.deliveryCharges ? (typeof updated.deliveryCharges === 'string' ? JSON.parse(updated.deliveryCharges) : updated.deliveryCharges) : null; } catch { return null; } })(),
      bundlePricing: (() => { try { return updated.bundlePricing ? (typeof updated.bundlePricing === 'string' ? JSON.parse(updated.bundlePricing) : updated.bundlePricing) : null; } catch { return null; } })(),
      gallery: (() => { try { return updated.gallery ? (typeof updated.gallery === 'string' ? JSON.parse(updated.gallery) : updated.gallery) : []; } catch { return []; } })(),
      active: updated.active,
      customHamperEnabled: updated.customHamperEnabled ?? 0,
      customHamperTitle: updated.customHamperTitle || "",
      customHamperBody: updated.customHamperBody || "",
      customHamperInstagram: updated.customHamperInstagram || "",
      customHamperContact: updated.customHamperContact || "",
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
