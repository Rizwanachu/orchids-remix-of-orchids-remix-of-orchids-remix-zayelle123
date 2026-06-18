import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { seoSettings } from "@/../shared/schema";
import { eq } from "drizzle-orm";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const all = await db.select().from(seoSettings).orderBy(seoSettings.pagePath);
    return NextResponse.json({ pages: all });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const existing = await db.select().from(seoSettings).where(eq(seoSettings.pagePath, body.pagePath)).limit(1);

    if (existing.length > 0) {
      const [updated] = await db.update(seoSettings).set({
        metaTitle: body.metaTitle || "",
        metaDescription: body.metaDescription || "",
        keywords: body.keywords || "",
        canonicalUrl: body.canonicalUrl || "",
        ogImage: body.ogImage || "",
        updatedAt: new Date().toISOString(),
      }).where(eq(seoSettings.pagePath, body.pagePath)).returning();
      return NextResponse.json(updated);
    }

    const [created] = await db.insert(seoSettings).values({
      pagePath: body.pagePath,
      metaTitle: body.metaTitle || "",
      metaDescription: body.metaDescription || "",
      keywords: body.keywords || "",
      canonicalUrl: body.canonicalUrl || "",
      ogImage: body.ogImage || "",
      updatedAt: new Date().toISOString(),
    }).returning();
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
