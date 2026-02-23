import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { giftHampers } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";
import { asc } from "drizzle-orm";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const list = await db.select().from(giftHampers).orderBy(asc(giftHampers.displayOrder));
    return NextResponse.json({ hampers: list });
  } catch (error) {
    console.error("Error fetching gift hampers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { title, description, imageUrl, price, includedProductIds, displayOrder, isActive } = body;

    if (!title || price === undefined) {
      return NextResponse.json({ error: "Title and price are required" }, { status: 400 });
    }

    const [hamper] = await db
      .insert(giftHampers)
      .values({
        title,
        description: description || "",
        imageUrl: imageUrl || "",
        price: price.toString(),
        includedProductIds: includedProductIds || [],
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      })
      .returning();

    await logAdminActivity(admin.id, admin.email, "gift_hamper_created", `Gift hamper "${title}" created`);

    return NextResponse.json(hamper, { status: 201 });
  } catch (error) {
    console.error("Error creating gift hamper:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
