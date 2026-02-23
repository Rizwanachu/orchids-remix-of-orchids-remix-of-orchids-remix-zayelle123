import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { pageContents } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { slug } = await params;
    const [page] = await db.select().from(pageContents).where(eq(pageContents.slug, slug));

    if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error fetching page content:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { slug } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.metaTitle !== undefined) updateData.metaTitle = body.metaTitle;
    if (body.metaDescription !== undefined) updateData.metaDescription = body.metaDescription;
    if (body.isPublished !== undefined) updateData.isPublished = body.isPublished;

    const [updated] = await db
      .update(pageContents)
      .set(updateData)
      .where(eq(pageContents.slug, slug))
      .returning();

    if (!updated) return NextResponse.json({ error: "Page not found" }, { status: 404 });

    await logAdminActivity(admin.id, admin.email, "page_updated", `Page "${slug}" updated`);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating page content:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { slug } = await params;

    const [deleted] = await db
      .delete(pageContents)
      .where(eq(pageContents.slug, slug))
      .returning();

    if (!deleted) return NextResponse.json({ error: "Page not found" }, { status: 404 });

    await logAdminActivity(admin.id, admin.email, "page_deleted", `Page "${slug}" deleted`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting page content:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
