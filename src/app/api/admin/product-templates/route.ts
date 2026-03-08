import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { productTemplates } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allTemplates = await db.select().from(productTemplates);
  return NextResponse.json(allTemplates);
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json({ error: "Template name is required" }, { status: 400 });
    }

    const [newTemplate] = await db.insert(productTemplates).values({
      name: body.name,
      description: body.description || "",
      details: body.details || "",
      dimension: body.dimension || "",
      material: body.material || "",
      careInstructions: body.careInstructions || "",
      shippingPolicy: body.shippingPolicy || "",
      returnPolicy: body.returnPolicy || "",
    }).returning();

    await logAdminActivity(admin.id, admin.email, "template_added", `Added product template: ${body.name}`);

    return NextResponse.json(newTemplate);
  } catch (error: any) {
    console.error("Error adding product template:", error);
    if (error.message?.includes("unique") || error.code === "23505") {
      return NextResponse.json({ error: "A template with this name already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to add template" }, { status: 500 });
  }
}
