import PDFDocument from "pdfkit";
import { getItemConfigLines, type OrderItemConfig } from "./order-item-display";

interface OrderItem extends OrderItemConfig {
  productName: string;
  quantity: number;
  price: string;
}

interface OrderData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: string | null;
  totalAmount: string;
  paymentMethod: string | null;
  paymentStatus: string;
  orderStatus: string;
  discountAmount: string | null;
  couponCode: string | null;
  createdAt: Date | string;
  items: OrderItem[];
}

function rupees(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const brandColor = "#5C4B3D";
const textColor = "#1A1A1A";
const mutedColor = "#757575";
const lineColor = "#E8E4DE";

function renderInvoice(
  doc: PDFKit.PDFDocument,
  order: OrderData,
  ox: number,
  oy: number,
  width: number,
  copyLabel: string
) {
  const innerPad = 36;
  const left = ox + innerPad;
  const right = ox + width - innerPad;
  const contentW = right - left;

  const invoiceDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  let y = oy + 28;

  // ── Header ──────────────────────────────────────────────────────
  doc.font("Helvetica-Bold").fontSize(32).fillColor(brandColor).text("ZAYELLE", left, y);
  doc.font("Helvetica").fontSize(14).fillColor(mutedColor).text("Premium Hijabs & Modest Accessories", left, y + 36);

  doc.font("Helvetica-Bold").fontSize(28).fillColor(brandColor)
    .text("INVOICE", right - 220, y, { width: 220, align: "right" });
  doc.font("Helvetica").fontSize(14).fillColor(mutedColor)
    .text(copyLabel, right - 220, y + 36, { width: 220, align: "right" });

  y += 64;
  doc.moveTo(left, y).lineTo(right, y).strokeColor(lineColor).lineWidth(1).stroke();
  y += 12;

  // ── Order meta row ───────────────────────────────────────────────
  const colW = contentW / 3;
  doc.font("Helvetica-Bold").fontSize(13).fillColor(mutedColor).text("ORDER ID", left, y);
  doc.font("Helvetica").fontSize(16).fillColor(textColor).text(order.orderId, left, y + 18);

  doc.font("Helvetica-Bold").fontSize(13).fillColor(mutedColor).text("DATE", left + colW, y);
  doc.font("Helvetica").fontSize(16).fillColor(textColor).text(invoiceDate, left + colW, y + 18);

  const isCOD = (order.paymentMethod || "").toLowerCase().includes("cod");
  const payStatusText = isCOD ? "Payable on Delivery" : (order.paymentStatus === "paid" ? "Paid" : order.paymentStatus);
  const statusColor = payStatusText === "Paid" ? "#2E7D32" : "#E65100";
  doc.font("Helvetica-Bold").fontSize(13).fillColor(mutedColor).text("PAYMENT", left + 2 * colW, y);
  doc.font("Helvetica-Bold").fontSize(16).fillColor(statusColor).text(payStatusText, left + 2 * colW, y + 18);

  y += 52;
  doc.moveTo(left, y).lineTo(right, y).strokeColor(lineColor).lineWidth(1).stroke();
  y += 12;

  // ── Bill to / Ship to ────────────────────────────────────────────
  const halfW = contentW / 2 - 12;
  doc.font("Helvetica-Bold").fontSize(14).fillColor(brandColor).text("BILL TO", left, y);
  doc.font("Helvetica-Bold").fontSize(16).fillColor(textColor).text(order.customerName, left, y + 20, { width: halfW });
  doc.font("Helvetica").fontSize(14).fillColor(mutedColor).text(order.customerEmail, left, y + 42, { width: halfW });
  if (order.customerPhone) {
    doc.text(order.customerPhone, left, y + 62, { width: halfW });
  }

  doc.font("Helvetica-Bold").fontSize(14).fillColor(brandColor).text("SHIP TO", left + halfW + 24, y);
  if (order.shippingAddress) {
    doc.font("Helvetica").fontSize(14).fillColor(textColor)
      .text(order.shippingAddress, left + halfW + 24, y + 20, { width: halfW });
  }

  y += 96;
  doc.moveTo(left, y).lineTo(right, y).strokeColor(lineColor).lineWidth(1).stroke();
  y += 12;

  // ── Items table ──────────────────────────────────────────────────
  const c1 = left + 8;
  const c2 = right - 300;
  const c3 = right - 190;
  const c4 = right - 80;

  doc.rect(left, y, contentW, 28).fill("#F5F2ED");
  doc.font("Helvetica-Bold").fontSize(13).fillColor(mutedColor);
  doc.text("ITEM", c1, y + 8);
  doc.text("QTY", c2, y + 8, { width: 80, align: "center" });
  doc.text("PRICE", c3, y + 8, { width: 100, align: "right" });
  doc.text("TOTAL", c4, y + 8, { width: 75, align: "right" });
  y += 28;

  for (let idx = 0; idx < order.items.length; idx++) {
    const item = order.items[idx];
    const lineTotal = item.quantity * parseFloat(item.price);
    const cfgLines = getItemConfigLines(item);

    doc.font("Helvetica").fontSize(15).fillColor(textColor);
    const nameW = c2 - c1 - 8;
    doc.text(item.productName, c1, y + 4, { width: nameW });
    const nameH = doc.heightOfString(item.productName, { width: nameW });

    let cfgH = 0;
    if (cfgLines.length > 0) {
      const cfgText = cfgLines.join("\n");
      doc.font("Helvetica").fontSize(12).fillColor(mutedColor)
        .text(cfgText, c1, y + 4 + nameH, { width: nameW, lineGap: 0 });
      cfgH = doc.heightOfString(cfgText, { width: nameW, lineGap: 0 });
    }

    doc.font("Helvetica").fontSize(15).fillColor(textColor)
      .text(String(item.quantity), c2, y + 4, { width: 80, align: "center" });
    doc.text(rupees(parseFloat(item.price)), c3, y + 4, { width: 100, align: "right" });
    doc.font("Helvetica-Bold").text(rupees(lineTotal), c4, y + 4, { width: 75, align: "right" });

    const rowH = Math.max(24, nameH + cfgH + 8);
    y += rowH;
    doc.moveTo(left, y).lineTo(right, y).strokeColor("#F0EDE8").lineWidth(0.5).stroke();
  }

  y += 12;

  // ── Totals ───────────────────────────────────────────────────────
  const totalAmount = parseFloat(order.totalAmount);
  const discount = order.discountAmount ? parseFloat(order.discountAmount) : 0;
  const codCharge = isCOD ? 49 : 0;
  const subtotal = totalAmount + discount - codCharge;

  const sumX = c3;
  const sumValX = c4;

  doc.font("Helvetica").fontSize(15).fillColor(mutedColor).text("Subtotal:", sumX, y, { width: 100, align: "right" });
  doc.font("Helvetica").fillColor(textColor).text(rupees(subtotal), sumValX, y, { width: 75, align: "right" });
  y += 22;

  if (discount > 0) {
    doc.font("Helvetica").fontSize(15).fillColor(mutedColor).text("Discount:", sumX, y, { width: 100, align: "right" });
    doc.font("Helvetica").fillColor("#2E7D32").text(`-${rupees(discount)}`, sumValX, y, { width: 75, align: "right" });
    y += 22;
  }

  doc.font("Helvetica").fontSize(15).fillColor(mutedColor).text("Shipping:", sumX, y, { width: 100, align: "right" });
  doc.font("Helvetica").fillColor(textColor).text("FREE", sumValX, y, { width: 75, align: "right" });
  y += 22;

  if (codCharge > 0) {
    doc.font("Helvetica").fontSize(15).fillColor(mutedColor).text("COD Charges:", sumX, y, { width: 100, align: "right" });
    doc.font("Helvetica").fillColor(textColor).text(rupees(codCharge), sumValX, y, { width: 75, align: "right" });
    y += 24;
  }

  doc.moveTo(sumX, y).lineTo(right, y).strokeColor(brandColor).lineWidth(1.5).stroke();
  y += 8;

  doc.font("Helvetica-Bold").fontSize(20).fillColor(brandColor).text("Total:", sumX, y, { width: 100, align: "right" });
  doc.font("Helvetica-Bold").fontSize(20).fillColor(brandColor).text(rupees(totalAmount), sumValX, y, { width: 75, align: "right" });

  y += 36;

  // ── Footer ───────────────────────────────────────────────────────
  doc.font("Helvetica").fontSize(14).fillColor(brandColor)
    .text("Thank you for shopping with Zayelle!", left, y, { width: contentW, align: "center" });
  doc.font("Helvetica").fontSize(12).fillColor(mutedColor)
    .text("www.zayelle.in  |  @zayelle.in", left, y + 20, { width: contentW, align: "center" });
}

export function generateInvoicePDF(order: OrderData): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: "A4", margin: 0, autoFirstPage: true, bufferPages: false });

  const pageWidth = doc.page.width;
  const marginX = 36;
  const usableW = pageWidth - 2 * marginX;

  // Page 1 — Customer Copy
  renderInvoice(doc, order, marginX, 20, usableW, "CUSTOMER COPY");

  // Page 2 — Merchant Copy
  doc.addPage({ size: "A4", margin: 0 });
  renderInvoice(doc, order, marginX, 20, usableW, "MERCHANT COPY");

  return doc;
}
