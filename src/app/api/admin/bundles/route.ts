import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { productBundles } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";
import { asc } from "drizzle-orm";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const bundles = await db
      .select()
      .from(productBundles)
      .orderBy(asc(productBundles.displayOrder));
    return NextResponse.json({ bundles });
  } catch (error) {
    console.error("Error fetching bundles:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { name, description, bundleType, items, price, comparePrice, badge, imageUrl, isActive, displayOrder } = body;

    if (!name || !price) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 });
    }

    const [bundle] = await db
      .insert(productBundles)
      .values({
        name,
        description: description || "",
        bundleType: bundleType || "custom",
        items: typeof items === "string" ? items : JSON.stringify(items || []),
        price: String(price),
        comparePrice: comparePrice ? String(comparePrice) : null,
        badge: badge || null,
        imageUrl: imageUrl || "",
        isActive: isActive !== undefined ? (isActive ? 1 : 0) : 1,
        displayOrder: displayOrder || 0,
        createdAt: new Date().toISOString(),
      })
      .returning();

    await logAdminActivity(admin.id, admin.email, "bundle_created", `Bundle "${name}" created`);
    return NextResponse.json(bundle, { status: 201 });
  } catch (error) {
    console.error("Error creating bundle:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
