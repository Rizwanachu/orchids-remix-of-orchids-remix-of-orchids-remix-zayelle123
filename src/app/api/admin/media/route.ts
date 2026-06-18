import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { db } from "@/../server/db";
import { media } from "@/../shared/schema";
import { eq, desc } from "drizzle-orm";
import cloudinary from "@/lib/cloudinary";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await db
      .select({
        filename: media.filename,
        url: media.url,
        cloudinaryUrl: media.cloudinaryUrl,
        size: media.size,
        createdAt: media.createdAt,
        altText: media.altText,
        seoTitle: media.seoTitle,
      })
      .from(media)
      .orderBy(desc(media.createdAt));

    return NextResponse.json(results.map(f => ({
      filename: f.filename,
      url: f.cloudinaryUrl ?? f.url,
      size: f.size,
      createdAt: f.createdAt,
      altText: f.altText || "",
      seoTitle: f.seoTitle || "",
    })));
  } catch (error) {
    console.error("Failed to list media:", error);
    return NextResponse.json({ error: "Failed to list media" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { filename, altText, seoTitle } = await request.json();
    if (!filename) return NextResponse.json({ error: "filename required" }, { status: 400 });

    const updateData: any = {};
    if (altText !== undefined) updateData.altText = altText;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;

    await db.update(media).set(updateData).where(eq(media.filename, filename));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update media:", error);
    return NextResponse.json({ error: "Failed to update media" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { filename } = await request.json();

    const rows = await db
      .select({ cloudinaryUrl: media.cloudinaryUrl })
      .from(media)
      .where(eq(media.filename, filename))
      .limit(1);

    if (rows.length > 0 && rows[0].cloudinaryUrl) {
      const publicId = `zayelle/${filename.replace(/\.[^.]+$/, "")}`;
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      } catch (err) {
        console.warn(`Cloudinary delete failed for ${publicId}:`, err);
      }
    }

    await db.delete(media).where(eq(media.filename, filename));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete media:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
