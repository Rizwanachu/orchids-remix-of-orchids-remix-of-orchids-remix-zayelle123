import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { homepageSections } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";
import { asc } from "drizzle-orm";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const sections = await db.select().from(homepageSections).orderBy(asc(homepageSections.displayOrder));
    return NextResponse.json({ sections });
  } catch (error) {
    console.error("Error fetching homepage layout:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { sections } = body;

    if (!Array.isArray(sections)) {
      return NextResponse.json({ error: "sections array is required" }, { status: 400 });
    }

    for (const section of sections) {
      const { sectionName, label, isVisible, displayOrder } = section;
      const isVisibleInt = isVisible ? 1 : 0;
      await db
        .insert(homepageSections)
        .values({ sectionName, label: label || sectionName, isVisible: isVisibleInt, displayOrder })
        .onConflictDoUpdate({
          target: homepageSections.sectionName,
          set: { isVisible: isVisibleInt, displayOrder },
        });
    }

    await logAdminActivity(admin.id, admin.email, "homepage_layout_updated", "Homepage section order/visibility updated");

    const updated = await db.select().from(homepageSections).orderBy(asc(homepageSections.displayOrder));
    return NextResponse.json({ sections: updated });
  } catch (error) {
    console.error("Error updating homepage layout:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
