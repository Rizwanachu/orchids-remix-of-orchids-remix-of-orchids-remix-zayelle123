import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { productTemplates } from "@/../shared/schema";
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

    const updateData: Record<string, any> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.details !== undefined) updateData.details = body.details;
    if (body.dimension !== undefined) updateData.dimension = body.dimension;
    if (body.material !== undefined) updateData.material = body.material;
    if (body.careInstructions !== undefined) updateData.careInstructions = body.careInstructions;
    if (body.shippingPolicy !== undefined) updateData.shippingPolicy = body.shippingPolicy;
    if (body.returnPolicy !== undefined) updateData.returnPolicy = body.returnPolicy;

    const [updated] = await db.update(productTemplates)
      .set(updateData)
      .where(eq(productTemplates.id, parseInt(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    await logAdminActivity(admin.id, admin.email, "template_updated", `Updated product template: ${updated.name}`);

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating product template:", error);
    if (error.message?.includes("unique") || error.code === "23505") {
      return NextResponse.json({ error: "A template with this name already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to update template" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const [deleted] = await db.delete(productTemplates)
      .where(eq(productTemplates.id, parseInt(id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    await logAdminActivity(admin.id, admin.email, "template_deleted", `Deleted product template: ${deleted.name}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting product template:", error);
    return NextResponse.json({ error: error.message || "Failed to delete template" }, { status: 500 });
  }
}
