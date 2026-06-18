import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { collections } from "@/../shared/schema";
import { asc, eq, and } from "drizzle-orm";

const CDN_HEADERS = {
  "Cache-Control": "no-store",
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const homepage = searchParams.get("homepage") === "1";

    const where = homepage
      ? and(eq(collections.isActive, 1), eq(collections.showOnHomepage, 1))
      : eq(collections.isActive, 1);

    const list = await db
      .select()
      .from(collections)
      .where(where)
      .orderBy(asc(collections.displayOrder));
    return NextResponse.json({ collections: list }, { headers: CDN_HEADERS });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json({ collections: [] });
  }
}
