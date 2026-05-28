import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { orders, orderItems } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { eq, sql, gte, lte, and } from "drizzle-orm";
import PDFDocument from "pdfkit";

function csv(v: string | number | null | undefined): string {
  const s = String(v ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function rupees(n: number) {
  return `Rs. ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "csv";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const today = new Date().toISOString().split("T")[0];

  try {
    // Build conditions
    const paidCond = eq(orders.paymentStatus, "paid");
    const conds = [paidCond];
    if (dateFrom) conds.push(gte(orders.createdAt, dateFrom));
    if (dateTo) {
      const to = new Date(dateTo); to.setHours(23, 59, 59, 999);
      conds.push(lte(orders.createdAt, to.toISOString()));
    }
    const where = and(...conds);

    const [summary] = await db.select({
      totalRevenue: sql<string>`COALESCE(SUM(${orders.totalAmount}::numeric), 0)`,
      totalOrders: sql<number>`COUNT(*)::int`,
      avgOrderValue: sql<string>`COALESCE(AVG(${orders.totalAmount}::numeric), 0)`,
    }).from(orders).where(where);

    const dailySales = await db.select({
      date: sql<string>`SUBSTRING(${orders.createdAt}, 1, 10)`,
      revenue: sql<string>`COALESCE(SUM(${orders.totalAmount}::numeric), 0)`,
      orders: sql<number>`COUNT(*)::int`,
    }).from(orders).where(where)
      .groupBy(sql`SUBSTRING(${orders.createdAt}, 1, 10)`)
      .orderBy(sql`SUBSTRING(${orders.createdAt}, 1, 10)`);

    const monthlySales = await db.select({
      month: sql<string>`SUBSTRING(${orders.createdAt}, 1, 7)`,
      revenue: sql<string>`COALESCE(SUM(${orders.totalAmount}::numeric), 0)`,
      orders: sql<number>`COUNT(*)::int`,
    }).from(orders).where(where)
      .groupBy(sql`SUBSTRING(${orders.createdAt}, 1, 7)`)
      .orderBy(sql`SUBSTRING(${orders.createdAt}, 1, 7)`);

    const bestProducts = await db.select({
      productName: orderItems.productName,
      totalQuantity: sql<number>`SUM(${orderItems.quantity})::int`,
      totalRevenue: sql<string>`SUM(${orderItems.price}::numeric * ${orderItems.quantity})`,
    }).from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(where)
      .groupBy(orderItems.productName)
      .orderBy(sql`SUM(${orderItems.quantity}) DESC`);

    const dateLabel = dateFrom && dateTo ? `${dateFrom} to ${dateTo}` : dateFrom ? `From ${dateFrom}` : dateTo ? `Up to ${dateTo}` : "All Time";

    if (format === "csv") {
      const lines: string[] = [];

      lines.push("ZAYELLE ANALYTICS REPORT");
      lines.push(csv(`Date Range: ${dateLabel}`));
      lines.push(csv(`Generated: ${today}`));
      lines.push("");

      lines.push("SUMMARY");
      lines.push(["Metric", "Value"].map(csv).join(","));
      lines.push(["Total Revenue", `Rs. ${parseFloat(summary.totalRevenue).toFixed(2)}`].map(csv).join(","));
      lines.push(["Total Orders", summary.totalOrders].map(csv).join(","));
      lines.push(["Average Order Value", `Rs. ${parseFloat(summary.avgOrderValue).toFixed(2)}`].map(csv).join(","));
      lines.push("");

      lines.push("BEST SELLING PRODUCTS");
      lines.push(["Rank", "Product", "Qty Sold", "Revenue (Rs.)"].map(csv).join(","));
      bestProducts.forEach((p, i) => {
        lines.push([i + 1, p.productName, p.totalQuantity, parseFloat(p.totalRevenue).toFixed(2)].map(csv).join(","));
      });
      lines.push("");

      lines.push("DAILY SALES");
      lines.push(["Date", "Revenue (Rs.)", "Orders"].map(csv).join(","));
      dailySales.forEach(d => {
        lines.push([d.date, parseFloat(d.revenue).toFixed(2), d.orders].map(csv).join(","));
      });
      lines.push("");

      lines.push("MONTHLY SALES");
      lines.push(["Month", "Revenue (Rs.)", "Orders"].map(csv).join(","));
      monthlySales.forEach(m => {
        lines.push([m.month, parseFloat(m.revenue).toFixed(2), m.orders].map(csv).join(","));
      });

      return new NextResponse(lines.join("\n"), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="analytics-${today}.csv"`,
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

    const checkPage = (needed: number) => {
      if (y + needed > doc.page.height - 50) { doc.addPage(); y = 36; }
    };

    // Header
    doc.font("Helvetica-Bold").fontSize(22).fillColor(brandColor).text("ZAYELLE", ml, y);
    doc.font("Helvetica").fontSize(9).fillColor(mutedColor).text("Analytics Report", ml, y + 26);
    doc.font("Helvetica").fontSize(9).fillColor(mutedColor)
      .text(`${dateLabel}  •  Generated: ${fmtDate(today)}`, W - mr - 260, y + 26, { width: 260, align: "right" });
    y += 46;
    doc.moveTo(ml, y).lineTo(W - mr, y).strokeColor(brandColor).lineWidth(1).stroke();
    y += 14;

    // Summary cards
    const summaryCards = [
      { label: "Total Revenue", value: rupees(parseFloat(summary.totalRevenue)) },
      { label: "Total Orders", value: String(summary.totalOrders) },
      { label: "Avg Order Value", value: rupees(parseFloat(summary.avgOrderValue)) },
    ];
    const cardW = (cw - 16) / 3;
    summaryCards.forEach((s, i) => {
      const bx = ml + i * (cardW + 8);
      doc.rect(bx, y, cardW, 44).fill("#F5F2ED");
      doc.font("Helvetica").fontSize(8).fillColor(mutedColor).text(s.label, bx + 10, y + 8, { width: cardW - 20 });
      doc.font("Helvetica-Bold").fontSize(13).fillColor(textColor).text(s.value, bx + 10, y + 22, { width: cardW - 20 });
    });
    y += 58;

    // Section helper
    const renderSection = (title: string, colDefs: { label: string; x: number; w: number; align?: "left" | "right" | "center" }[], rows: string[][]) => {
      checkPage(24 + rows.length * 16 + 20);

      doc.font("Helvetica-Bold").fontSize(11).fillColor(brandColor).text(title, ml, y);
      y += 16;

      // Table header
      doc.rect(ml, y, cw, 16).fill("#F5F2ED");
      for (const col of colDefs) {
        doc.font("Helvetica-Bold").fontSize(7.5).fillColor(mutedColor)
          .text(col.label, col.x + 4, y + 4, { width: col.w - 8, align: col.align || "left" });
      }
      y += 16;

      rows.forEach((row, i) => {
        checkPage(18);
        doc.rect(ml, y, cw, 16).fill(i % 2 === 0 ? "#FFFFFF" : "#FAFAF8");
        colDefs.forEach((col, ci) => {
          doc.font("Helvetica").fontSize(8).fillColor(textColor)
            .text(row[ci] ?? "", col.x + 4, y + 4, { width: col.w - 8, align: col.align || "left", ellipsis: true });
        });
        doc.moveTo(ml, y + 16).lineTo(W - mr, y + 16).strokeColor(lineColor).lineWidth(0.4).stroke();
        y += 16;
      });
      y += 16;
    };

    // Best Selling Products
    renderSection("Best Selling Products", [
      { label: "#", x: ml, w: 30, align: "center" },
      { label: "PRODUCT", x: ml + 30, w: 300 },
      { label: "QTY SOLD", x: ml + 330, w: 80, align: "right" },
      { label: "REVENUE", x: ml + 410, w: 113, align: "right" },
    ], bestProducts.map((p, i) => [
      String(i + 1),
      p.productName,
      String(p.totalQuantity),
      rupees(parseFloat(p.totalRevenue)),
    ]));

    // Daily Sales
    renderSection("Daily Sales", [
      { label: "DATE", x: ml, w: 140 },
      { label: "REVENUE", x: ml + 140, w: 150, align: "right" },
      { label: "ORDERS", x: ml + 290, w: 233, align: "right" },
    ], dailySales.map(d => [
      fmtDate(d.date),
      rupees(parseFloat(d.revenue)),
      String(d.orders),
    ]));

    // Monthly Sales
    renderSection("Monthly Sales", [
      { label: "MONTH", x: ml, w: 140 },
      { label: "REVENUE", x: ml + 140, w: 150, align: "right" },
      { label: "ORDERS", x: ml + 290, w: 233, align: "right" },
    ], monthlySales.map(m => [
      m.month,
      rupees(parseFloat(m.revenue)),
      String(m.orders),
    ]));

    // Footer
    checkPage(20);
    doc.font("Helvetica").fontSize(8).fillColor(mutedColor)
      .text(`Zayelle Analytics Report  •  ${fmtDate(today)}  •  www.zayelle.in`, ml, y, { width: cw, align: "center" });

    doc.end();
    await new Promise<void>(resolve => doc.on("end", resolve));
    const pdf = Buffer.concat(chunks);

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="analytics-${today}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error exporting analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
