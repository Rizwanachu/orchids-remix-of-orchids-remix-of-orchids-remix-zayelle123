import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { db } from "@/../server/db";
import { media } from "@/../shared/schema";

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { cloudinaryUrl, filename, size, mimeType } = await request.json();

    if (!cloudinaryUrl || !filename) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await db.insert(media).values({
      filename,
      url: `/api/media/serve/${filename}`,
      mimeType: mimeType || "image/jpeg",
      size: size || 0,
      content: Buffer.alloc(0),
      cloudinaryUrl,
    });

    return NextResponse.json({ url: cloudinaryUrl });
  } catch (error) {
    console.error("Register media error:", error);
    return NextResponse.json({ error: "Failed to register media" }, { status: 500 });
  }
}
