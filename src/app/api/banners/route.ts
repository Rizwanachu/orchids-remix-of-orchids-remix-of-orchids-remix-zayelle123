import { NextResponse } from "next/server";
import { db } from "@/../server/db";
import { banners } from "@/../shared/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const activeBanners = await db.select().from(banners).where(eq(banners.isActive, true));
    return NextResponse.json(activeBanners);
  } catch (error: any) {
    console.error("Error fetching banners:", error);
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
}
