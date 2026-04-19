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
  const innerPad = 18;
  const left = ox + innerPad;
  const right = ox + width - innerPad;
  const contentW = right - left;

  const invoiceDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  let y = oy + 14;

  doc.font("Helvetica-Bold").fontSize(16).fillColor(brandColor).text("ZAYELLE", left, y);
  doc.font("Helvetica").fontSize(7).fillColor(mutedColor).text("Premium Hijabs & Modest Accessories", left, y + 18);

  doc.font("Helvetica-Bold").fontSize(14).fillColor(brandColor)
    .text("INVOICE", right - 150, y, { width: 150, align: "right" });
  doc.font("Helvetica").fontSize(7).fillColor(mutedColor)
    .text(copyLabel, right - 150, y + 18, { width: 150, align: "right" });

  y += 32;
  doc.moveTo(left, y).lineTo(right, y).strokeColor(lineColor).lineWidth(0.5).stroke();
  y += 6;

  const colW = contentW / 3;
  doc.font("Helvetica-Bold").fontSize(6.5).fillColor(mutedColor).text("ORDER ID", left, y);
  doc.font("Helvetica").fontSize(8).fillColor(textColor).text(order.orderId, left, y + 9);

  doc.font("Helvetica-Bold").fontSize(6.5).fillColor(mutedColor).text("DATE", left + colW, y);
  doc.font("Helvetica").fontSize(8).fillColor(textColor).text(invoiceDate, left + colW, y + 9);

  const isCOD = (order.paymentMethod || "").toLowerCase().includes("cod");
  const payStatusText = isCOD ? "Payable on Delivery" : (order.paymentStatus === "paid" ? "Paid" : order.paymentStatus);
  const statusColor = payStatusText === "Paid" ? "#2E7D32" : "#E65100";
  doc.font("Helvetica-Bold").fontSize(6.5).fillColor(mutedColor).text("PAYMENT", left + 2 * colW, y);
  doc.font("Helvetica-Bold").fontSize(8).fillColor(statusColor).text(payStatusText, left + 2 * colW, y + 9);

  y += 26;
  doc.moveTo(left, y).lineTo(right, y).strokeColor(lineColor).lineWidth(0.5).stroke();
  y += 6;

  const halfW = contentW / 2 - 6;
  doc.font("Helvetica-Bold").fontSize(7).fillColor(brandColor).text("BILL TO", left, y);
  doc.font("Helvetica-Bold").fontSize(8).fillColor(textColor).text(order.customerName, left, y + 10, { width: halfW });
  doc.font("Helvetica").fontSize(7).fillColor(mutedColor).text(order.customerEmail, left, y + 21, { width: halfW });
  if (order.customerPhone) {
    doc.text(order.customerPhone, left, y + 30, { width: halfW });
  }

  doc.font("Helvetica-Bold").fontSize(7).fillColor(brandColor).text("SHIP TO", left + halfW + 12, y);
  if (order.shippingAddress) {
    doc.font("Helvetica").fontSize(7).fillColor(textColor)
      .text(order.shippingAddress, left + halfW + 12, y + 10, { width: halfW });
  }

  y += 48;
  doc.moveTo(left, y).lineTo(right, y).strokeColor(lineColor).lineWidth(0.5).stroke();
  y += 6;

  const c1 = left + 6;
  const c2 = right - 180;
  const c3 = right - 120;
  const c4 = right - 60;

  doc.rect(left, y, contentW, 14).fill("#F5F2ED");
  doc.font("Helvetica-Bold").fontSize(6.5).fillColor(mutedColor);
  doc.text("ITEM", c1, y + 4);
  doc.text("QTY", c2, y + 4, { width: 50, align: "center" });
  doc.text("PRICE", c3, y + 4, { width: 55, align: "right" });
  doc.text("TOTAL", c4, y + 4, { width: 55, align: "right" });
  y += 14;

  for (let idx = 0; idx < order.items.length; idx++) {
    const item = order.items[idx];
    const lineTotal = item.quantity * parseFloat(item.price);
    const cfgLines = getItemConfigLines(item);

    doc.font("Helvetica").fontSize(7.5).fillColor(textColor);
    const nameW = c2 - c1 - 4;
    doc.text(item.productName, c1, y + 2, { width: nameW });
    const nameH = doc.heightOfString(item.productName, { width: nameW });

    let cfgH = 0;
    if (cfgLines.length > 0) {
      const cfgText = cfgLines.join("\n");
      doc.font("Helvetica").fontSize(6).fillColor(mutedColor)
        .text(cfgText, c1, y + 2 + nameH, { width: nameW, lineGap: 0 });
      cfgH = doc.heightOfString(cfgText, { width: nameW, lineGap: 0 });
    }

    doc.font("Helvetica").fontSize(7.5).fillColor(textColor)
      .text(String(item.quantity), c2, y + 2, { width: 50, align: "center" });
    doc.text(rupees(parseFloat(item.price)), c3, y + 2, { width: 55, align: "right" });
    doc.font("Helvetica-Bold").text(rupees(lineTotal), c4, y + 2, { width: 55, align: "right" });

    const rowH = Math.max(12, nameH + cfgH + 4);
    y += rowH;
    doc.moveTo(left, y).lineTo(right, y).strokeColor("#F0EDE8").lineWidth(0.5).stroke();
  }

  y += 6;

  const totalAmount = parseFloat(order.totalAmount);
  const discount = order.discountAmount ? parseFloat(order.discountAmount) : 0;
  const codCharge = isCOD ? 49 : 0;
  const subtotal = totalAmount + discount - codCharge;

  const sumX = c3;
  const sumValX = c4;

  doc.font("Helvetica").fontSize(7.5).fillColor(mutedColor).text("Subtotal:", sumX, y, { width: 55, align: "right" });
  doc.font("Helvetica").fillColor(textColor).text(rupees(subtotal), sumValX, y, { width: 55, align: "right" });
  y += 11;

  if (discount > 0) {
    doc.font("Helvetica").fontSize(7.5).fillColor(mutedColor).text("Discount:", sumX, y, { width: 55, align: "right" });
    doc.font("Helvetica").fillColor("#2E7D32").text(`-${rupees(discount)}`, sumValX, y, { width: 55, align: "right" });
    y += 11;
  }

  doc.font("Helvetica").fontSize(7.5).fillColor(mutedColor).text("Shipping:", sumX, y, { width: 55, align: "right" });
  doc.font("Helvetica").fillColor(textColor).text("FREE", sumValX, y, { width: 55, align: "right" });
  y += 11;

  if (codCharge > 0) {
    doc.font("Helvetica").fontSize(7.5).fillColor(mutedColor).text("COD Charges:", sumX, y, { width: 55, align: "right" });
    doc.font("Helvetica").fillColor(textColor).text(rupees(codCharge), sumValX, y, { width: 55, align: "right" });
    y += 12;
  }

  doc.moveTo(sumX, y).lineTo(right, y).strokeColor(brandColor).lineWidth(1).stroke();
  y += 4;

  doc.font("Helvetica-Bold").fontSize(10).fillColor(brandColor).text("Total:", sumX, y, { width: 55, align: "right" });
  doc.font("Helvetica-Bold").fontSize(10).fillColor(brandColor).text(rupees(totalAmount), sumValX, y, { width: 55, align: "right" });

  y += 18;
  doc.font("Helvetica").fontSize(7).fillColor(brandColor)
    .text("Thank you for shopping with Zayelle!", left, y, { width: contentW, align: "center" });
  doc.font("Helvetica").fontSize(6).fillColor(mutedColor)
    .text("www.zayelle.in  |  @zayelle.in", left, y + 10, { width: contentW, align: "center" });
}

export function generateInvoicePDF(order: OrderData): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: "A4", margin: 0, autoFirstPage: true, bufferPages: false });

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const marginX = 24;
  const usableW = pageWidth - 2 * marginX;
  const halfH = pageHeight / 2;

  renderInvoice(doc, order, marginX, 16, usableW, "CUSTOMER COPY");

  const midY = halfH;
  doc.save();
  doc.dash(3, { space: 3 });
  doc.moveTo(marginX, midY).lineTo(pageWidth - marginX, midY)
    .strokeColor(mutedColor).lineWidth(0.5).stroke();
  doc.undash();
  doc.font("Helvetica").fontSize(6).fillColor(mutedColor)
    .text("✂  cut here", marginX, midY - 4, { width: usableW, align: "center" });
  doc.restore();

  renderInvoice(doc, order, marginX, halfH + 16, usableW, "MERCHANT COPY");

  return doc;
}
