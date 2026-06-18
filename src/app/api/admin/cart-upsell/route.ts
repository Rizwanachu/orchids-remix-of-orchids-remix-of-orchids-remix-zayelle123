import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { sql } from "drizzle-orm";
import { verifyAdminToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const rows = await db.execute(sql`
      SELECT
        cu.id,
        cu.product_id,
        cu.custom_price,
        cu.display_order,
        cu.is_active,
        cu.created_at,
        p.name,
        p.handle,
        p.image,
        p.price AS original_price
      FROM cart_upsell_items cu
      JOIN products p ON p.id = cu.product_id
      ORDER BY cu.display_order ASC, cu.id ASC
    `);
    return NextResponse.json(Array.from(rows).map(r => ({ ...r })));
  } catch (error) {
    console.error("GET /api/admin/cart-upsell error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { productId, customPrice, displayOrder = 0, isActive = true } = body;

    if (!productId || customPrice === undefined || customPrice === "") {
      return NextResponse.json({ error: "productId and customPrice are required" }, { status: 400 });
    }

    const result = await db.execute(sql`
      INSERT INTO cart_upsell_items (product_id, custom_price, display_order, is_active)
      VALUES (${productId}, ${customPrice}, ${displayOrder}, ${isActive})
      RETURNING *
    `);
    return NextResponse.json({ ...result[0] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/cart-upsell error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
