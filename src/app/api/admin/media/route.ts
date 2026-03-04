import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { readdir, stat, unlink, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    
    const files = await readdir(uploadDir);

    const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
    const imageFiles = files.filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return imageExtensions.includes(ext);
    });

    const fileDetails = await Promise.all(
      imageFiles.map(async (filename) => {
        const filePath = path.join(uploadDir, filename);
        const fileStat = await stat(filePath);
        
        // Skip directories if somehow they matched extension (unlikely but safe)
        if (fileStat.isDirectory()) return null;

        return {
          filename,
          url: `/uploads/${filename}`,
          size: fileStat.size,
          createdAt: fileStat.birthtime.toISOString(),
          modifiedAt: fileStat.mtime.toISOString(),
        };
      })
    );

    const validFileDetails = fileDetails.filter(f => f !== null);

    validFileDetails.sort(
      (a, b) =>
        new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
    );

    return NextResponse.json(validFileDetails);
  } catch (error) {
    console.error("Failed to list media:", error);
    return NextResponse.json({ error: "Failed to list media" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { filename } = await request.json();

    if (!filename || filename.includes("..") || filename.includes("/")) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "public", "uploads", filename);
    await unlink(filePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete media:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
