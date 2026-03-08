import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { db } from "@/../server/db";
import { media } from "@/../shared/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await db.select().from(media).orderBy(desc(media.createdAt));
    
    return NextResponse.json(results.map(f => ({
      filename: f.filename,
      url: f.url,
      size: f.size,
      createdAt: f.createdAt,
    })));
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
    await db.delete(media).where(eq(media.filename, filename));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete media:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
