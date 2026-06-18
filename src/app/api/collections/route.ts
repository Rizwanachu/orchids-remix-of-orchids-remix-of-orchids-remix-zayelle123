import { NextResponse } from "next/server";
import { db } from "@/../server/db";
import { collections } from "@/../shared/schema";
import { asc, eq } from "drizzle-orm";

const CDN_HEADERS = {
  "Cache-Control": "no-store",
};

export async function GET() {
  try {
    const list = await db
      .select()
      .from(collections)
      .where(eq(collections.isActive, 1))
      .orderBy(asc(collections.displayOrder));
    return NextResponse.json({ collections: list }, { headers: CDN_HEADERS });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json({ collections: [] });
  }
}
