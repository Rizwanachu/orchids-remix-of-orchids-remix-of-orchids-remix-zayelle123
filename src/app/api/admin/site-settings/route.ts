import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { siteSettings } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";
import { eq } from "drizzle-orm";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const settings = await db.select().from(siteSettings);
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key));

    let result;
    if (existing.length > 0) {
      [result] = await db
        .update(siteSettings)
        .set({ value: value ?? "", updatedAt: new Date().toISOString() })
        .where(eq(siteSettings.key, key))
        .returning();
    } else {
      [result] = await db
        .insert(siteSettings)
        .values({ key, value: value ?? "" })
        .returning();
    }

    await logAdminActivity(admin.id, admin.email, "site_setting_updated", `Site setting "${key}" updated`);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error upserting site setting:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
