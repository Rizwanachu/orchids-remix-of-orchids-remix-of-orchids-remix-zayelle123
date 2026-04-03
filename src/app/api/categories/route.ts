import { NextResponse } from "next/server";
import { db } from "@/../server/db";
import { categories } from "@/../shared/schema";
import { asc } from "drizzle-orm";

const DEFAULT_CATEGORIES = [
  { name: "Chiffon Hijabs", value: "chiffon-hijabs", displayOrder: 0 },
  { name: "Satin Silk Hijabs", value: "satin-silk-hijabs", displayOrder: 1 },
  { name: "Premium Jersey Wraps", value: "premium-jersey-wraps", displayOrder: 2 },
  { name: "Everyday Essentials", value: "everyday-essentials", displayOrder: 3 },
  { name: "Occasion Hijabs", value: "occasion-hijabs", displayOrder: 4 },
  { name: "Accessories", value: "accessories", displayOrder: 5 },
  { name: "Gift Hampers", value: "gift-hampers", displayOrder: 6 },
];

export async function GET() {
  try {
    let allCategories = await db.select().from(categories).orderBy(asc(categories.displayOrder));

    if (allCategories.length === 0) {
      await db.insert(categories).values(DEFAULT_CATEGORIES);
      allCategories = await db.select().from(categories).orderBy(asc(categories.displayOrder));
    }

    return NextResponse.json(allCategories, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
