import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { productColors } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";
import { asc } from "drizzle-orm";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allColors = await db.select().from(productColors).orderBy(asc(productColors.id));
  return NextResponse.json(allColors);
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.name || !body.hexValue) {
      return NextResponse.json({ error: "Name and hex value are required" }, { status: 400 });
    }

    const [newColor] = await db.insert(productColors).values({
      name: body.name,
      hexValue: body.hexValue,
    }).returning();

    await logAdminActivity(admin.id, admin.email, "color_added", `Added color: ${body.name} (${body.hexValue})`);

    return NextResponse.json(newColor);
  } catch (error: any) {
    console.error("Error adding color:", error);
    return NextResponse.json({ error: error.message || "Failed to add color" }, { status: 500 });
  }
}
