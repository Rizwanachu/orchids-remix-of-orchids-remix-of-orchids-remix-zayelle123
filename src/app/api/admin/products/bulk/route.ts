import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { products } from "@/../shared/schema";
import { inArray } from "drizzle-orm";
import { verifyAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-logger";

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, ids, category } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No product IDs provided" }, { status: 400 });
    }

    const numericIds = ids.map((id: string) => parseInt(id));

    if (action === "delete") {
      const deleted = await db.delete(products).where(inArray(products.id, numericIds)).returning();
      await logAdminActivity(admin.id, admin.email, "bulk_product_delete", `Bulk deleted ${deleted.length} products`);
      return NextResponse.json({ success: true, count: deleted.length });
    }

    if (action === "set_category") {
      if (!category) {
        return NextResponse.json({ error: "Category is required" }, { status: 400 });
      }
      const updated = await db.update(products).set({ category }).where(inArray(products.id, numericIds)).returning();
      await logAdminActivity(admin.id, admin.email, "bulk_product_category", `Set category "${category}" for ${updated.length} products`);
      return NextResponse.json({ success: true, count: updated.length });
    }

    if (action === "toggle_active") {
      const productsList = await db.select().from(products).where(inArray(products.id, numericIds));
      let updatedCount = 0;
      for (const p of productsList) {
        await db.update(products).set({ active: p.active === 1 ? 0 : 1 }).where(inArray(products.id, [p.id]));
        updatedCount++;
      }
      await logAdminActivity(admin.id, admin.email, "bulk_product_toggle", `Toggled active status for ${updatedCount} products`);
      return NextResponse.json({ success: true, count: updatedCount });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in bulk product action:", error);
    return NextResponse.json({ error: error.message || "Failed to perform bulk action" }, { status: 500 });
  }
}
