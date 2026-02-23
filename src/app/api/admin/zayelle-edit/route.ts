import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { zayelleEdits } from "@/../shared/schema";
import { asc } from "drizzle-orm";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await db.select().from(zayelleEdits).orderBy(asc(zayelleEdits.displayOrder));
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const [item] = await db.insert(zayelleEdits).values({
      imageUrl: body.imageUrl,
      title: body.title || "",
      subtitle: body.subtitle || "",
      buttonText: body.buttonText || "Shop Now",
      redirectLink: body.redirectLink || "",
      displayOrder: body.displayOrder ?? 0,
    }).returning();

    await logAdminActivity(admin.id, admin.email, "zayelle_edit_added", `Added Zayelle Edit item: ${body.title}`);

    return NextResponse.json(item);
  } catch (error: any) {
    console.error("Error adding zayelle edit:", error);
    return NextResponse.json({ error: error.message || "Failed to add item" }, { status: 500 });
  }
}
