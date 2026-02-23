import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { orders, orderItems } from "@/../shared/schema";
import { eq } from "drizzle-orm";
import { verifyAdmin } from "@/lib/admin-auth";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { generateInvoicePDF } from "@/lib/generate-invoice-pdf";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_change_me");

async function verifyUser(): Promise<{ id: number; email: string } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value || cookieStore.get("token")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { id: payload.id as number, email: payload.email as string };
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get("email");

    const admin = await verifyAdmin();
    const user = !admin ? await verifyUser() : null;

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderId, id));

    if (!order) {
      const numericId = parseInt(id);
      if (!isNaN(numericId)) {
        const [orderById] = await db
          .select()
          .from(orders)
          .where(eq(orders.id, numericId));
        if (orderById) {
          return handleInvoice(orderById, admin, user, emailParam);
        }
      }
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return handleInvoice(order, admin, user, emailParam);
  } catch (error) {
    console.error("Error generating invoice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleInvoice(
  order: typeof orders.$inferSelect,
  admin: { id: number; email: string; role: string } | null,
  user: { id: number; email: string } | null,
  emailParam: string | null
) {
  if (!admin) {
    const verifiedEmail = user?.email || emailParam;
    if (!verifiedEmail) {
      return NextResponse.json({ error: "Authentication required. Provide email parameter or log in." }, { status: 401 });
    }
    if (verifiedEmail !== order.customerEmail) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const isPrepaid = order.paymentMethod?.toLowerCase() === "prepaid";
  const isCOD = order.paymentMethod?.toLowerCase() === "cod" || order.paymentMethod?.toLowerCase() === "cash on delivery";

  if (isPrepaid && order.paymentStatus !== "paid") {
    return NextResponse.json({ error: "Invoice not available — payment not completed" }, { status: 400 });
  }

  if (isCOD && order.orderStatus === "cancelled") {
    return NextResponse.json({ error: "Invoice not available — order cancelled" }, { status: 400 });
  }

  if (!isPrepaid && !isCOD && order.paymentStatus !== "paid") {
    return NextResponse.json({ error: "Invoice not available" }, { status: 400 });
  }

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  const doc = generateInvoicePDF({
    orderId: order.orderId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    shippingAddress: order.shippingAddress,
    totalAmount: order.totalAmount,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    discountAmount: order.discountAmount,
    couponCode: order.couponCode,
    createdAt: order.createdAt,
    items: items.map((item) => ({
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
    })),
  });

  const chunks: Buffer[] = [];

  return new Promise<NextResponse>((resolve) => {
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      resolve(
        new NextResponse(pdfBuffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="invoice-${order.orderId}.pdf"`,
            "Content-Length": String(pdfBuffer.length),
          },
        })
      );
    });
    doc.end();
  });
}
