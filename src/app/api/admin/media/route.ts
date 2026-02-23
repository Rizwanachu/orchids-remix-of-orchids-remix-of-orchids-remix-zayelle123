import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { readdir, stat, unlink } from "fs/promises";
import path from "path";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const files = await readdir(uploadDir);

    const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
    const imageFiles = files.filter((f) =>
      imageExtensions.includes(path.extname(f).toLowerCase())
    );

    const fileDetails = await Promise.all(
      imageFiles.map(async (filename) => {
        const filePath = path.join(uploadDir, filename);
        const fileStat = await stat(filePath);
        return {
          filename,
          url: `/uploads/${filename}`,
          size: fileStat.size,
          createdAt: fileStat.birthtime.toISOString(),
          modifiedAt: fileStat.mtime.toISOString(),
        };
      })
    );

    fileDetails.sort(
      (a, b) =>
        new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
    );

    return NextResponse.json(fileDetails);
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
