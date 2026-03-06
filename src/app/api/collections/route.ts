import { NextResponse } from "next/server";
import { db } from "@/../server/db";
import { collections } from "@/../shared/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(collections).orderBy(asc(collections.displayOrder));
    return NextResponse.json({ collections: list });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json({ collections: [] });
  }
}
