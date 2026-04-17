import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { orders, orderItems } from "@/../shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { sendOrderConfirmationEmail, sendNewOrderNotificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerEmail, customerPhone, shippingAddress, items, paymentMethod, couponCode, discountAmount, totalAmount } = body;

    if (!customerName || !customerEmail || !items || items.length === 0) {
      return NextResponse.json({ error: "Customer name, email, and items are required" }, { status: 400 });
    }

    for (const it of items) {
      if (it.bundleType) {
        const cs = Array.isArray(it.colorSelections) ? it.colorSelections : null;
        const m = String(it.bundleType).match(/(\d+)/);
        const bundleQty = m ? parseInt(m[1], 10) : 0;
        if (!bundleQty) {
          return NextResponse.json({ error: `Invalid bundle label for "${it.productName || it.name}"` }, { status: 400 });
        }
        if (!cs || cs.length === 0) {
          return NextResponse.json({ error: `Bundle item "${it.productName || it.name}" requires colour selections` }, { status: 400 });
        }
        const sum = cs.reduce((s: number, c: any) => s + (Number(c.quantity) || 0), 0);
        if (sum !== bundleQty) {
          return NextResponse.json({ error: `Bundle quantity mismatch for "${it.productName || it.name}": selected ${sum} of ${bundleQty}` }, { status: 400 });
        }
      }
    }

    const [{ maxNum }] = await db.execute(
      sql`SELECT COALESCE(MAX(CAST(SUBSTRING(order_id FROM 5) AS INTEGER)), 10000) AS "maxNum" FROM orders WHERE order_id ~ '^ZAY-[0-9]+$'`
    ) as unknown as Array<{ maxNum: number }>;
    const nextNum = Math.max(10001, Number(maxNum) + 1);
    const orderId = `ZAY-${nextNum}`;

    const nowIso = new Date().toISOString();
    const [newOrder] = await db
      .insert(orders)
      .values({
        orderId,
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        shippingAddress: shippingAddress || null,
        totalAmount: String(totalAmount),
        paymentMethod: paymentMethod || null,
        couponCode: couponCode || null,
        discountAmount: discountAmount ? String(discountAmount) : null,
        paymentStatus: paymentMethod?.toLowerCase() === "cod" || paymentMethod?.toLowerCase() === "cash on delivery" ? "unpaid" : "paid",
        orderStatus: "processing",
        createdAt: nowIso,
        updatedAt: nowIso,
      })
      .returning();

    const orderItemValues = items.map((item: any) => ({
      orderId: newOrder.id,
      productName: item.productName || item.name || item.title,
      productHandle: item.productHandle || item.handle || null,
      quantity: item.quantity,
      price: String(item.price),
      image: item.image || null,
      colorSelections: item.colorSelections && Array.isArray(item.colorSelections) && item.colorSelections.length > 0
        ? JSON.stringify(item.colorSelections)
        : null,
      selectedColor: item.selectedColor && typeof item.selectedColor === "object"
        ? JSON.stringify(item.selectedColor)
        : (typeof item.selectedColor === "string" && item.selectedColor.trim() ? item.selectedColor : null),
      selectedSize: item.selectedSize || null,
      bundleType: item.bundleType || null,
    }));

    for (const it of orderItemValues) console.log("ORDER ITEM DEBUG:", it);
    await db.insert(orderItems).values(orderItemValues);

    if (couponCode) {
      await db.execute(
        sql`UPDATE coupons SET current_usage = current_usage + 1 WHERE code = ${couponCode}`
      );
    }

    console.log("Order created:", orderId);
    console.log("Attempting to send email...");
    
    await sendOrderConfirmationEmail({
      id: newOrder.id,
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      totalAmount: String(totalAmount),
      paymentMethod,
      paymentStatus: newOrder.paymentStatus,
      items: items.map((item: any) => ({
        productName: item.productName || item.name || item.title,
        quantity: item.quantity,
        price: String(item.price),
        image: item.image || null,
        colorSelections: item.colorSelections && Array.isArray(item.colorSelections) && item.colorSelections.length > 0
          ? JSON.stringify(item.colorSelections) : null,
        selectedColor: item.selectedColor && typeof item.selectedColor === "object" ? JSON.stringify(item.selectedColor)
          : (typeof item.selectedColor === "string" && item.selectedColor.trim() ? item.selectedColor : null),
        selectedSize: item.selectedSize || null,
        bundleType: item.bundleType || null,
      })),
      couponCode,
      discountAmount: discountAmount ? String(discountAmount) : null,
    });

    await sendNewOrderNotificationEmail({
      id: newOrder.id,
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      totalAmount: String(totalAmount),
      paymentMethod,
      paymentStatus: newOrder.paymentStatus,
      items: items.map((item: any) => ({
        productName: item.productName || item.name || item.title,
        quantity: item.quantity,
        price: String(item.price),
        image: item.image || null,
        colorSelections: item.colorSelections && Array.isArray(item.colorSelections) && item.colorSelections.length > 0
          ? JSON.stringify(item.colorSelections) : null,
        selectedColor: item.selectedColor && typeof item.selectedColor === "object" ? JSON.stringify(item.selectedColor)
          : (typeof item.selectedColor === "string" && item.selectedColor.trim() ? item.selectedColor : null),
        selectedSize: item.selectedSize || null,
        bundleType: item.bundleType || null,
      })),
      couponCode,
      discountAmount: discountAmount ? String(discountAmount) : null,
    });

    return NextResponse.json({ order: newOrder }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const ordersList = await db
      .select()
      .from(orders)
      .where(eq(orders.customerEmail, email))
      .orderBy(desc(orders.id), desc(orders.createdAt));

    const orderIds = ordersList.map((o) => o.id);
    let items: any[] = [];
    if (orderIds.length > 0) {
      items = await db
        .select()
        .from(orderItems)
        .where(sql`${orderItems.orderId} IN (${sql.join(orderIds.map(id => sql`${id}`), sql`, `)})`);
    }

    const ordersWithItems = ordersList.map((order) => ({
      ...order,
      items: items.filter((item) => item.orderId === order.id),
    }));

    return NextResponse.json({ orders: ordersWithItems });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
