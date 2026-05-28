import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { orders, users } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { desc, ne } from "drizzle-orm";
import PDFDocument from "pdfkit";

function csv(v: string | number | null | undefined): string {
  const s = String(v ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function fmtDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function rupees(n: number) {
  return `Rs. ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

async function buildCustomers() {
  const allOrders = await db
    .select({
      customerName: orders.customerName,
      customerEmail: orders.customerEmail,
      customerPhone: orders.customerPhone,
      totalAmount: orders.totalAmount,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .orderBy(desc(orders.createdAt));

  const registeredUsers = await db
    .select({ id: users.id, name: users.name, email: users.email, phone: users.phone, address: users.address, createdAt: users.createdAt })
    .from(users)
    .where(ne(users.role, "admin"));

  const registeredMap = new Map<string, { id: number; name: string; phone: string | null; address: string | null; createdAt: string }>();
  for (const u of registeredUsers) registeredMap.set(u.email, u);

  const customerMap = new Map<string, { userId: number | null; name: string; email: string; phone: string | null; address: string | null; totalOrders: number; totalSpend: number; lastOrderDate: string | null; hasAccount: boolean }>();

  for (const o of allOrders) {
    const existing = customerMap.get(o.customerEmail);
    if (existing) {
      existing.totalOrders++;
      existing.totalSpend += parseFloat(o.totalAmount);
      if (!existing.lastOrderDate || o.createdAt > existing.lastOrderDate) existing.lastOrderDate = o.createdAt;
    } else {
      const reg = registeredMap.get(o.customerEmail);
      customerMap.set(o.customerEmail, {
        userId: reg?.id || null,
        name: reg?.name || o.customerName,
        email: o.customerEmail,
        phone: reg?.phone || o.customerPhone,
        address: reg?.address || null,
        totalOrders: 1,
        totalSpend: parseFloat(o.totalAmount),
        lastOrderDate: o.createdAt,
        hasAccount: !!reg,
      });
    }
  }

  for (const [email, reg] of registeredMap) {
    if (!customerMap.has(email)) {
      customerMap.set(email, { userId: reg.id, name: reg.name, email, phone: reg.phone, address: reg.address, totalOrders: 0, totalSpend: 0, lastOrderDate: null, hasAccount: true });
    }
  }

  return Array.from(customerMap.values()).sort((a, b) => {
    const dA = a.lastOrderDate ? new Date(a.lastOrderDate).getTime() : 0;
    const dB = b.lastOrderDate ? new Date(b.lastOrderDate).getTime() : 0;
    return dB - dA;
  });
}

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "csv";

  try {
    const customers = await buildCustomers();
    const today = new Date().toISOString().split("T")[0];

    if (format === "csv") {
      const headers = ["Name", "Email", "Phone", "Address", "Total Orders", "Total Spend (Rs.)", "Last Order Date", "Has Account"];
      const rows = [headers.map(csv).join(",")];
      for (const c of customers) {
        rows.push([
          c.name, c.email, c.phone || "", c.address || "",
          c.totalOrders, c.totalSpend.toFixed(2),
          c.lastOrderDate ? fmtDate(c.lastOrderDate) : "",
          c.hasAccount ? "Yes" : "No",
        ].map(csv).join(","));
      }
      return new NextResponse(rows.join("\n"), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="customers-${today}.csv"`,
        },
      });
    }

    // PDF
    const brandColor = "#5C4B3D";
    const mutedColor = "#757575";
    const lineColor = "#E8E4DE";
    const textColor = "#1A1A1A";

    const doc = new PDFDocument({ size: "A4", margin: 0, autoFirstPage: true, bufferPages: false });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));

    const W = doc.page.width;
    const ml = 36, mr = 36;
    const cw = W - ml - mr;
    let y = 36;

    // Header
    doc.font("Helvetica-Bold").fontSize(22).fillColor(brandColor).text("ZAYELLE", ml, y);
    doc.font("Helvetica").fontSize(9).fillColor(mutedColor).text("Customer Report", ml, y + 26);
    doc.font("Helvetica").fontSize(9).fillColor(mutedColor).text(`Generated: ${fmtDate(new Date().toISOString())}  •  ${customers.length} customers`, W - mr - 220, y + 26, { width: 220, align: "right" });
    y += 46;
    doc.moveTo(ml, y).lineTo(W - mr, y).strokeColor(brandColor).lineWidth(1).stroke();
    y += 14;

    // Summary row
    const totalSpend = customers.reduce((s, c) => s + c.totalSpend, 0);
    const withOrders = customers.filter(c => c.totalOrders > 0).length;
    const summaries = [
      { label: "Total Customers", value: String(customers.length) },
      { label: "With Orders", value: String(withOrders) },
      { label: "Total Revenue", value: rupees(totalSpend) },
      { label: "Avg Spend", value: withOrders ? rupees(totalSpend / withOrders) : "Rs. 0.00" },
    ];
    const boxW = cw / summaries.length - 8;
    summaries.forEach((s, i) => {
      const bx = ml + i * (boxW + 8);
      doc.rect(bx, y, boxW, 38).fill("#F5F2ED");
      doc.font("Helvetica").fontSize(7.5).fillColor(mutedColor).text(s.label, bx + 8, y + 6, { width: boxW - 16 });
      doc.font("Helvetica-Bold").fontSize(11).fillColor(textColor).text(s.value, bx + 8, y + 18, { width: boxW - 16 });
    });
    y += 52;

    // Table header
    const cols = [
      { label: "NAME", x: ml, w: 110 },
      { label: "EMAIL", x: ml + 110, w: 140 },
      { label: "PHONE", x: ml + 250, w: 88 },
      { label: "ORDERS", x: ml + 338, w: 52, align: "right" as const },
      { label: "TOTAL SPEND", x: ml + 390, w: 90, align: "right" as const },
      { label: "LAST ORDER", x: ml + 480, w: 83, align: "right" as const },
    ];

    doc.rect(ml, y, cw, 16).fill("#F5F2ED");
    for (const col of cols) {
      doc.font("Helvetica-Bold").fontSize(7.5).fillColor(mutedColor)
        .text(col.label, col.x + 4, y + 4, { width: col.w - 8, align: col.align || "left" });
    }
    y += 16;

    for (let i = 0; i < customers.length; i++) {
      const c = customers[i];

      // New page if needed
      if (y > doc.page.height - 50) {
        doc.addPage();
        y = 36;
        doc.rect(ml, y, cw, 16).fill("#F5F2ED");
        for (const col of cols) {
          doc.font("Helvetica-Bold").fontSize(7.5).fillColor(mutedColor)
            .text(col.label, col.x + 4, y + 4, { width: col.w - 8, align: col.align || "left" });
        }
        y += 16;
      }

      const rowBg = i % 2 === 0 ? "#FFFFFF" : "#FAFAF8";
      doc.rect(ml, y, cw, 18).fill(rowBg);
      doc.font("Helvetica").fontSize(8).fillColor(textColor);
      doc.text(c.name, cols[0].x + 4, y + 5, { width: cols[0].w - 8, ellipsis: true });
      doc.text(c.email, cols[1].x + 4, y + 5, { width: cols[1].w - 8, ellipsis: true });
      doc.text(c.phone || "—", cols[2].x + 4, y + 5, { width: cols[2].w - 8 });
      doc.text(String(c.totalOrders), cols[3].x + 4, y + 5, { width: cols[3].w - 8, align: "right" });
      doc.font("Helvetica-Bold").text(rupees(c.totalSpend), cols[4].x + 4, y + 5, { width: cols[4].w - 8, align: "right" });
      doc.font("Helvetica").fillColor(mutedColor).text(fmtDate(c.lastOrderDate), cols[5].x + 4, y + 5, { width: cols[5].w - 8, align: "right" });
      doc.moveTo(ml, y + 18).lineTo(W - mr, y + 18).strokeColor(lineColor).lineWidth(0.4).stroke();
      y += 18;
    }

    // Footer
    y += 12;
    doc.font("Helvetica").fontSize(8).fillColor(mutedColor)
      .text(`Zayelle Customer Report  •  ${fmtDate(new Date().toISOString())}  •  www.zayelle.in`, ml, y, { width: cw, align: "center" });

    doc.end();
    await new Promise<void>(resolve => doc.on("end", resolve));
    const pdf = Buffer.concat(chunks);

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="customers-${today}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error exporting customers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
