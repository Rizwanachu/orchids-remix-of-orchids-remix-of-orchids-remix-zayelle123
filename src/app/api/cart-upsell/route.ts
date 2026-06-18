import { NextResponse } from "next/server";
import { db } from "@/../server/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.execute(sql`
      SELECT
        cu.id,
        cu.product_id,
        cu.custom_price,
        cu.display_order,
        p.name,
        p.handle,
        p.image,
        p.subtitle
      FROM cart_upsell_items cu
      JOIN products p ON p.id = cu.product_id
      WHERE cu.is_active = true
      ORDER BY cu.display_order ASC, cu.id ASC
    `);
    return NextResponse.json(Array.from(rows).map(r => ({ ...r })));
  } catch (error) {
    console.error("GET /api/cart-upsell error:", error);
    return NextResponse.json([]);
  }
}
