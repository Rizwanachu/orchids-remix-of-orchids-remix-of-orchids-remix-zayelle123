import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { categories } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";
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
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let allCategories = await db.select().from(categories).orderBy(asc(categories.displayOrder));

  if (allCategories.length === 0) {
    await db.insert(categories).values(DEFAULT_CATEGORIES);
    allCategories = await db.select().from(categories).orderBy(asc(categories.displayOrder));
  }

  return NextResponse.json(allCategories);
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.name || !body.value) {
      return NextResponse.json({ error: "Name and value are required" }, { status: 400 });
    }

    const [newCategory] = await db.insert(categories).values({
      name: body.name,
      value: body.value,
      displayOrder: body.displayOrder ?? 0,
    }).returning();

    await logAdminActivity(admin.id, admin.email, "category_added", `Added category: ${body.name}`);

    return NextResponse.json(newCategory);
  } catch (error: any) {
    console.error("Error adding category:", error);
    if (error.message?.includes("unique") || error.code === "23505") {
      return NextResponse.json({ error: "A category with this value already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to add category" }, { status: 500 });
  }
}
