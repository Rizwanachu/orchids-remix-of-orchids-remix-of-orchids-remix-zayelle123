import { NextResponse } from "next/server";
import { db } from "@/../server/db";
import { productBundles } from "@/../shared/schema";
import { asc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const bundles = await db
      .select()
      .from(productBundles)
      .where(eq(productBundles.isActive, 1))
      .orderBy(asc(productBundles.displayOrder));
    return NextResponse.json({ bundles });
  } catch {
    return NextResponse.json({ bundles: [] });
  }
}
