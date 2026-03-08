import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { badges } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";
import { asc } from "drizzle-orm";

const DEFAULT_BADGES = [
  { name: "New", value: "New", color: "" },
  { name: "Sale", value: "Sale", color: "" },
  { name: "Bestseller", value: "Bestseller", color: "" },
  { name: "Gift", value: "Gift", color: "" },
];

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let allBadges = await db.select().from(badges).orderBy(asc(badges.id));

  if (allBadges.length === 0) {
    await db.insert(badges).values(DEFAULT_BADGES);
    allBadges = await db.select().from(badges).orderBy(asc(badges.id));
  }

  return NextResponse.json(allBadges);
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

    const [newBadge] = await db.insert(badges).values({
      name: body.name,
      value: body.value,
      color: body.color ?? "",
    }).returning();

    await logAdminActivity(admin.id, admin.email, "badge_added", `Added badge: ${body.name}`);

    return NextResponse.json(newBadge);
  } catch (error: any) {
    console.error("Error adding badge:", error);
    if (error.message?.includes("unique") || error.code === "23505") {
      return NextResponse.json({ error: "A badge with this value already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to add badge" }, { status: 500 });
  }
}
