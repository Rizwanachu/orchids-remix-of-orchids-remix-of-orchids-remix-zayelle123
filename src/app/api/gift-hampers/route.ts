import { NextResponse } from "next/server";
import { db } from "@/../server/db";
import { giftHampers } from "@/../shared/schema";
import { asc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db
      .select()
      .from(giftHampers)
      .where(eq(giftHampers.isActive, true))
      .orderBy(asc(giftHampers.displayOrder));
    return NextResponse.json({ hampers: list });
  } catch (error) {
    console.error("Error fetching gift hampers:", error);
    return NextResponse.json({ hampers: [] });
  }
}
