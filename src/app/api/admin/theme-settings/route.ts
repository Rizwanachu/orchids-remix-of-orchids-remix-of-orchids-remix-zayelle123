import { db } from "@/../server/db";
import { themeSettings } from "@/../shared/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const settings = await db.select().from(themeSettings).limit(1);
    return NextResponse.json(settings[0] || {}, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "CDN-Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        "Vercel-CDN-Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch theme settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const existing = await db.select().from(themeSettings).limit(1);
    
    if (existing.length > 0) {
      // @ts-ignore - drizzle id filter
      await db.update(themeSettings).set({
        ...body,
        updatedAt: new Date().toISOString(),
      }).where(eq(themeSettings.id, existing[0].id));
    } else {
      await db.insert(themeSettings).values(body);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update theme settings" }, { status: 500 });
  }
}
