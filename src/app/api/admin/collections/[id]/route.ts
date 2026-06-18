import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { collections } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const collectionId = parseInt(id);
    const body = await request.json();

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured ? 1 : 0;
    if (body.isActive !== undefined) updateData.isActive = body.isActive ? 1 : 0;
    if (body.showOnHomepage !== undefined) updateData.showOnHomepage = body.showOnHomepage ? 1 : 0;
    if (body.displayOrder !== undefined) updateData.displayOrder = body.displayOrder;

    const [updated] = await db
      .update(collections)
      .set(updateData)
      .where(eq(collections.id, collectionId))
      .returning();

    if (!updated) return NextResponse.json({ error: "Collection not found" }, { status: 404 });

    await logAdminActivity(admin.id, admin.email, "collection_updated", `Collection "${updated.title}" updated`);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating collection:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const collectionId = parseInt(id);

    const [deleted] = await db
      .delete(collections)
      .where(eq(collections.id, collectionId))
      .returning();

    if (!deleted) return NextResponse.json({ error: "Collection not found" }, { status: 404 });

    await logAdminActivity(admin.id, admin.email, "collection_deleted", `Collection "${deleted.title}" deleted`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
