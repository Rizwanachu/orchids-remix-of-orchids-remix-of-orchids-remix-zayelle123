import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { banners } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allBanners = await db.select().from(banners);
  return NextResponse.json(allBanners);
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const [newBanner] = await db.insert(banners).values({
      title: body.title,
      subtitle: body.subtitle || "",
      buttonText: body.buttonText || "Shop Now",
      buttonLink: body.buttonLink || "",
      imageUrl: body.imageUrl,
      position: body.position || "hero",
      isActive: body.isActive !== undefined ? (body.isActive ? 1 : 0) : 1,
      titleFont: body.titleFont || "serif",
      titleColor: body.titleColor || "#5C4B3D",
      subtitleColor: body.subtitleColor || "#5C4B3D",
      titleFontSizeDesktop: body.titleFontSizeDesktop || "64px",
      titleFontSizeMobile: body.titleFontSizeMobile || "32px",
    }).returning();

    await logAdminActivity(admin.id, admin.email, "banner_created", `Created banner: ${body.title}`);

    return NextResponse.json(newBanner);
  } catch (error: any) {
    console.error("Error creating banner:", error);
    return NextResponse.json({ error: error.message || "Failed to create banner" }, { status: 500 });
  }
}
