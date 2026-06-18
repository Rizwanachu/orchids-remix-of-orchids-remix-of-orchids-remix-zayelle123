import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { sql } from "drizzle-orm";
import { verifyAdminToken } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const { customPrice, displayOrder, isActive, productId } = body;

    const setClauses: ReturnType<typeof sql>[] = [];
    if (customPrice !== undefined) setClauses.push(sql`custom_price = ${customPrice}`);
    if (displayOrder !== undefined) setClauses.push(sql`display_order = ${displayOrder}`);
    if (isActive !== undefined) setClauses.push(sql`is_active = ${isActive}`);
    if (productId !== undefined) setClauses.push(sql`product_id = ${productId}`);

    if (setClauses.length === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

    const setClause = setClauses.reduce((acc, clause, i) =>
      i === 0 ? clause : sql`${acc}, ${clause}`
    );

    const result = await db.execute(sql`
      UPDATE cart_upsell_items SET ${setClause} WHERE id = ${Number(id)} RETURNING *
    `);
    if (!result[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ...result[0] });
  } catch (error) {
    console.error("PATCH /api/admin/cart-upsell/[id] error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await db.execute(sql`DELETE FROM cart_upsell_items WHERE id = ${Number(id)}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/cart-upsell/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
