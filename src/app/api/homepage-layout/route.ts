import { NextResponse } from "next/server";
import { db } from "@/../server/db";
import { homepageSections } from "@/../shared/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const sections = await db.select().from(homepageSections).orderBy(asc(homepageSections.displayOrder));
    return NextResponse.json({ sections });
  } catch (error) {
    console.error("Error fetching homepage layout:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
