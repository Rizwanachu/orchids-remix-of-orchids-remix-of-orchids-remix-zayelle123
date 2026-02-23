import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { collections } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";
import { asc } from "drizzle-orm";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const list = await db.select().from(collections).orderBy(asc(collections.displayOrder));
    return NextResponse.json({ collections: list });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { title, slug, subtitle, description, imageUrl, isFeatured, displayOrder } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
    }

    const [collection] = await db
      .insert(collections)
      .values({
        title,
        slug,
        subtitle: subtitle || "",
        description: description || "",
        imageUrl: imageUrl || "",
        isFeatured: isFeatured || false,
        displayOrder: displayOrder || 0,
      })
      .returning();

    await logAdminActivity(admin.id, admin.email, "collection_created", `Collection "${title}" created`);

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
