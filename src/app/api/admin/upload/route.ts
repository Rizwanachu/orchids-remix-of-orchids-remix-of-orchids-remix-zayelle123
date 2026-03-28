import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import crypto from "crypto";
import { db } from "@/../server/db";
import { media } from "@/../shared/schema";
import { uploadStream } from "@/lib/cloudinary";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${crypto.randomBytes(16).toString("hex")}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await uploadStream(buffer, {
      public_id: `zayelle/${filename.replace(/\.[^.]+$/, "")}`,
      resource_type: "image",
    });

    const cloudinaryUrl = result.secure_url;
    const legacyUrl = `/api/media/serve/${filename}`;

    await db.insert(media).values({
      filename,
      url: legacyUrl,
      mimeType: file.type,
      size: file.size,
      content: Buffer.alloc(0),
      cloudinaryUrl,
    });

    return NextResponse.json({ url: cloudinaryUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
