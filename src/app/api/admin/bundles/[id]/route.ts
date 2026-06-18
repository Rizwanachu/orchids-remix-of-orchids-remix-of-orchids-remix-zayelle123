import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { productBundles } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";
import { eq } from "drizzle-orm";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.bundleType !== undefined) updates.bundleType = body.bundleType;
    if (body.items !== undefined) updates.items = typeof body.items === "string" ? body.items : JSON.stringify(body.items);
    if (body.price !== undefined) updates.price = String(body.price);
    if (body.comparePrice !== undefined) updates.comparePrice = body.comparePrice ? String(body.comparePrice) : null;
    if (body.badge !== undefined) updates.badge = body.badge || null;
    if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl;
    if (body.isActive !== undefined) updates.isActive = body.isActive ? 1 : 0;
    if (body.displayOrder !== undefined) updates.displayOrder = body.displayOrder;

    const [bundle] = await db
      .update(productBundles)
      .set(updates)
      .where(eq(productBundles.id, parseInt(id)))
      .returning();

    if (!bundle) return NextResponse.json({ error: "Bundle not found" }, { status: 404 });

    await logAdminActivity(admin.id, admin.email, "bundle_updated", `Bundle "${bundle.name}" updated`);
    return NextResponse.json(bundle);
  } catch (error) {
    console.error("Error updating bundle:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const [bundle] = await db
      .delete(productBundles)
      .where(eq(productBundles.id, parseInt(id)))
      .returning();

    if (!bundle) return NextResponse.json({ error: "Bundle not found" }, { status: 404 });

    await logAdminActivity(admin.id, admin.email, "bundle_deleted", `Bundle "${bundle.name}" deleted`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting bundle:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
