import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { uploadStream } from "@/lib/cloudinary";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Max 5MB" },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop() || "jpg";
    const publicId = `zayelle/reviews/${crypto.randomBytes(16).toString("hex")}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await uploadStream(buffer, {
      public_id: publicId,
      resource_type: "image",
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error("Review upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
