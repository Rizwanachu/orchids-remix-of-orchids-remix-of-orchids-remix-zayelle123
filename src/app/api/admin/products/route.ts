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
    deliveryCharges: (() => { try { return p.deliveryCharges ? (typeof p.deliveryCharges === 'string' ? JSON.parse(p.deliveryCharges) : p.deliveryCharges) : null; } catch { return null; } })(),
    bundlePricing: (() => { try { return p.bundlePricing ? (typeof p.bundlePricing === 'string' ? JSON.parse(p.bundlePricing) : p.bundlePricing) : null; } catch { return null; } })(),
    gallery: (() => { try { return p.gallery ? (typeof p.gallery === 'string' ? JSON.parse(p.gallery) : p.gallery) : []; } catch { return []; } })(),
    active: p.active,
    customHamperEnabled: p.customHamperEnabled ?? 0,
    customHamperTitle: p.customHamperTitle || "",
    customHamperBody: p.customHamperBody || "",
    customHamperInstagram: p.customHamperInstagram || "",
    customHamperContact: p.customHamperContact || "",
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
    
    // Validate handle uniqueness
    const existing = await db.select().from(products).where(eq(products.handle, body.handle)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "A product with this URL handle already exists. Please use a unique name or handle." }, { status: 400 });
    }

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
      details: Array.isArray(body.details) ? body.details.join("\n") : (body.details || ""),
      dimension: body.dimension || "",
      material: body.material || "",
      careInstructions: body.careInstructions || "",
      shippingPolicy: body.shippingPolicy || "",
      returnPolicy: body.returnPolicy || "",
      category: body.category || "",
      stockQuantity: body.stockQuantity ?? 100,
      lowStockThreshold: body.lowStockThreshold ?? 10,
      shippingCost: body.shippingCost != null ? String(body.shippingCost) : "49",
      shippingCostKerala: body.shippingCostKerala != null ? String(body.shippingCostKerala) : "49",
      isFreeShipping: body.isFreeShipping ? 1 : 0,
      colors: Array.isArray(body.colors) ? JSON.stringify(body.colors) : null,
      colorSwatchStyle: body.colorSwatchStyle || "pills",
      sizes: Array.isArray(body.sizes) ? JSON.stringify(body.sizes) : null,
      deliveryCharges: body.deliveryCharges ? JSON.stringify(body.deliveryCharges) : null,
      bundlePricing: Array.isArray(body.bundlePricing) && body.bundlePricing.length > 0 ? JSON.stringify(body.bundlePricing) : null,
      gallery: Array.isArray(body.gallery) ? JSON.stringify(body.gallery) : null,
      customHamperEnabled: body.customHamperEnabled ? 1 : 0,
      customHamperTitle: body.customHamperTitle || null,
      customHamperBody: body.customHamperBody || null,
      customHamperInstagram: body.customHamperInstagram || null,
      customHamperContact: body.customHamperContact || null,
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
      details: (() => {
        if (!newProduct.details) return [];
        const byNewline = newProduct.details.split("\n").map((d: string) => d.trim()).filter(Boolean);
        if (byNewline.length > 1) return byNewline;
        const byComma = newProduct.details.split(/,(?=[A-Z])/).map((d: string) => d.trim()).filter(Boolean);
        if (byComma.length > 1) return byComma;
        return byNewline;
      })(),
      dimension: newProduct.dimension || "",
      material: newProduct.material || "",
      careInstructions: newProduct.careInstructions || "",
      shippingPolicy: newProduct.shippingPolicy || "",
      returnPolicy: newProduct.returnPolicy || "",
      category: newProduct.category,
      stockQuantity: newProduct.stockQuantity,
      lowStockThreshold: newProduct.lowStockThreshold,
      shippingCost: Number(newProduct.shippingCost),
      shippingCostKerala: Number(newProduct.shippingCostKerala),
      isFreeShipping: newProduct.isFreeShipping,
      colors: (() => { try { return newProduct.colors ? (typeof newProduct.colors === 'string' ? JSON.parse(newProduct.colors) : newProduct.colors) : []; } catch { return []; } })(),
      colorSwatchStyle: newProduct.colorSwatchStyle || "pills",
      sizes: (() => { try { return newProduct.sizes ? (typeof newProduct.sizes === 'string' ? JSON.parse(newProduct.sizes) : newProduct.sizes) : []; } catch { return []; } })(),
      deliveryCharges: (() => { try { return newProduct.deliveryCharges ? (typeof newProduct.deliveryCharges === 'string' ? JSON.parse(newProduct.deliveryCharges) : newProduct.deliveryCharges) : null; } catch { return null; } })(),
      bundlePricing: (() => { try { return newProduct.bundlePricing ? (typeof newProduct.bundlePricing === 'string' ? JSON.parse(newProduct.bundlePricing) : newProduct.bundlePricing) : null; } catch { return null; } })(),
      gallery: (() => { try { return newProduct.gallery ? (typeof newProduct.gallery === 'string' ? JSON.parse(newProduct.gallery) : newProduct.gallery) : []; } catch { return []; } })(),
      customHamperEnabled: newProduct.customHamperEnabled ?? 0,
      customHamperTitle: newProduct.customHamperTitle || "",
      customHamperBody: newProduct.customHamperBody || "",
      customHamperInstagram: newProduct.customHamperInstagram || "",
      customHamperContact: newProduct.customHamperContact || "",
    });
  } catch (error: any) {
    console.error("Error adding product:", error);
    return NextResponse.json({ error: error.message || "Failed to add product" }, { status: 500 });
  }
}
