import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { pageContents } from "@/../shared/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const [page] = await db
      .select()
      .from(pageContents)
      .where(and(eq(pageContents.slug, slug), eq(pageContents.isPublished, 1)));

    if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error fetching page content:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
