import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/../server/db";
import { banners } from "@/../shared/schema";
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

    if (body.title !== undefined) updateData.title = body.title;
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
    if (body.buttonText !== undefined) updateData.buttonText = body.buttonText;
    if (body.buttonLink !== undefined) updateData.buttonLink = body.buttonLink;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.isActive !== undefined) updateData.isActive = body.isActive ? 1 : 0;
    if (body.titleFont !== undefined) updateData.titleFont = body.titleFont;
    if (body.titleColor !== undefined) updateData.titleColor = body.titleColor;
    if (body.subtitleColor !== undefined) updateData.subtitleColor = body.subtitleColor;
    if (body.titleFontSizeDesktop !== undefined) updateData.titleFontSizeDesktop = body.titleFontSizeDesktop;
    if (body.titleFontSizeMobile !== undefined) updateData.titleFontSizeMobile = body.titleFontSizeMobile;
    if (body.productIds !== undefined) updateData.productIds = JSON.stringify(body.productIds);
    if (body.bannerType !== undefined) updateData.bannerType = body.bannerType || "homepage";
    if (body.scheduleStart !== undefined) updateData.scheduleStart = body.scheduleStart || null;
    if (body.scheduleEnd !== undefined) updateData.scheduleEnd = body.scheduleEnd || null;

    const [updated] = await db.update(banners).set(updateData).where(eq(banners.id, parseInt(id))).returning();

    if (!updated) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    await logAdminActivity(admin.id, admin.email, "banner_updated", `Updated banner: ${updated.title}`);
    revalidatePath("/");

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating banner:", error);
    return NextResponse.json({ error: error.message || "Failed to update banner" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const [deleted] = await db.delete(banners).where(eq(banners.id, parseInt(id))).returning();

    if (!deleted) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    await logAdminActivity(admin.id, admin.email, "banner_deleted", `Deleted banner: ${deleted.title}`);
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting banner:", error);
    return NextResponse.json({ error: error.message || "Failed to delete banner" }, { status: 500 });
  }
}
