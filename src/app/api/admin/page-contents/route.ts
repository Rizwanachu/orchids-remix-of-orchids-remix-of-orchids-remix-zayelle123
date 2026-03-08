import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { pageContents } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";
import { asc } from "drizzle-orm";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const pages = await db.select().from(pageContents).orderBy(asc(pageContents.slug));
    return NextResponse.json({ pages });
  } catch (error) {
    console.error("Error fetching page contents:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { slug, title, content, metaTitle, metaDescription, isPublished } = body;

    if (!slug || !title) {
      return NextResponse.json({ error: "Slug and title are required" }, { status: 400 });
    }

    const [page] = await db
      .insert(pageContents)
      .values({
        slug,
        title,
        content: content ?? "",
        metaTitle: metaTitle ?? "",
        metaDescription: metaDescription ?? "",
        isPublished: isPublished !== undefined ? (isPublished ? 1 : 0) : 1,
      })
      .returning();

    await logAdminActivity(admin.id, admin.email, "page_created", `Page "${slug}" created`);

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error("Error creating page content:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
