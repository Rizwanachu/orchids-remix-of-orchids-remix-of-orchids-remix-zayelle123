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

  let y = oy;

  doc.font("Helvetica-Bold").fontSize(28).fillColor(brandColor).text("ZAYELLE", left, y);
  doc.font("Helvetica").fontSize(12).fillColor(mutedColor).text("Premium Hijabs & Modest Accessories", left, y + 34);

  doc.font("Helvetica-Bold").fontSize(22).fillColor(brandColor)
    .text("INVOICE", right - 180, y, { width: 180, align: "right" });
  doc.font("Helvetica").fontSize(11).fillColor(mutedColor)
    .text(copyLabel, right - 180, y + 28, { width: 180, align: "right" });

  y += 54;
  doc.moveTo(left, y).lineTo(right, y).strokeColor(lineColor).lineWidth(0.5).stroke();
  y += 10;

  const colW = contentW / 3;
  doc.font("Helvetica-Bold").fontSize(11).fillColor(mutedColor).text("ORDER ID", left, y);
  doc.font("Helvetica").fontSize(14).fillColor(textColor).text(order.orderId, left, y + 14);

  doc.font("Helvetica-Bold").fontSize(11).fillColor(mutedColor).text("DATE", left + colW, y);
  doc.font("Helvetica").fontSize(14).fillColor(textColor).text(invoiceDate, left + colW, y + 14);

  const isCOD = (order.paymentMethod || "").toLowerCase().includes("cod");
  const payStatusText = isCOD
    ? "Payable on Delivery"
    : order.paymentStatus === "paid"
    ? "Paid"
    : order.paymentStatus;
  const statusColor = payStatusText === "Paid" ? "#2E7D32" : "#E65100";
  doc.font("Helvetica-Bold").fontSize(11).fillColor(mutedColor).text("PAYMENT", left + 2 * colW, y);
  doc.font("Helvetica-Bold").fontSize(14).fillColor(statusColor).text(payStatusText, left + 2 * colW, y + 14);

  y += 44;
  doc.moveTo(left, y).lineTo(right, y).strokeColor(lineColor).lineWidth(0.5).stroke();
  y += 10;

  const halfW = contentW / 2 - 8;
  doc.font("Helvetica-Bold").fontSize(11).fillColor(mutedColor).text("BILL TO", left, y);
  doc.font("Helvetica-Bold").fontSize(15).fillColor(textColor).text(order.customerName, left, y + 15, { width: halfW });
  doc.font("Helvetica").fontSize(13).fillColor(mutedColor).text(order.customerEmail, left, y + 33, { width: halfW });
  if (order.customerPhone) {
    doc.font("Helvetica").fontSize(13).fillColor(mutedColor).text(order.customerPhone, left, y + 50, { width: halfW });
  }

  doc.font("Helvetica-Bold").fontSize(11).fillColor(mutedColor).text("SHIP TO", left + halfW + 16, y);
  if (order.shippingAddress) {
    doc.font("Helvetica").fontSize(13).fillColor(textColor)
      .text(order.shippingAddress, left + halfW + 16, y + 15, { width: halfW });
  }

  y += 96;
  doc.moveTo(left, y).lineTo(right, y).strokeColor(lineColor).lineWidth(0.5).stroke();
  y += 10;

  doc.font("Helvetica-Bold").fontSize(11).fillColor(mutedColor)
    .text("IF NOT DELIVERED, PLEASE RETURN TO:", left, y);
  y += 17;
  doc.font("Helvetica-Bold").fontSize(13).fillColor(textColor).text("Zayelle", left, y);
  y += 18;
  doc.font("Helvetica").fontSize(13).fillColor(textColor)
    .text("Thoppumpady Post Office, Kochi, Kerala \u2013 682005", left, y);
  y += 17;
  doc.font("Helvetica").fontSize(13).fillColor(textColor).text("Contact at 8891485648", left, y);
  y += 17;
  doc.font("Helvetica").fontSize(13).fillColor(textColor).text("Email at zayelle.in@gmail.com", left, y);
  y += 22;

  doc.moveTo(left, y).lineTo(right, y).strokeColor(lineColor).lineWidth(0.5).stroke();
  y += 8;

  const c1 = left + 6;
  const c2 = right - 200;
  const c3 = right - 130;
  const c4 = right - 60;

  doc.rect(left, y, contentW, 20).fill("#F5F2ED");
  doc.font("Helvetica-Bold").fontSize(11).fillColor(mutedColor);
  doc.text("ITEM", c1, y + 5);
  doc.text("QTY", c2, y + 5, { width: 60, align: "center" });
  doc.text("PRICE", c3, y + 5, { width: 65, align: "right" });
  doc.text("TOTAL", c4, y + 5, { width: 55, align: "right" });
  y += 20;

  for (let idx = 0; idx < order.items.length; idx++) {
    const item = order.items[idx];
    const lineTotal = item.quantity * parseFloat(item.price);
    const cfgLines = getItemConfigLines(item);

    doc.font("Helvetica").fontSize(14).fillColor(textColor);
    const nameW = c2 - c1 - 4;
    doc.text(item.productName, c1, y + 4, { width: nameW });
    const nameH = doc.heightOfString(item.productName, { width: nameW });

    let cfgH = 0;
    if (cfgLines.length > 0) {
      const cfgText = cfgLines.join("\n");
      doc.font("Helvetica").fontSize(11).fillColor(mutedColor)
        .text(cfgText, c1, y + 4 + nameH, { width: nameW, lineGap: 0 });
      cfgH = doc.heightOfString(cfgText, { width: nameW, lineGap: 0 });
    }

    doc.font("Helvetica").fontSize(14).fillColor(textColor)
      .text(String(item.quantity), c2, y + 4, { width: 60, align: "center" });
    doc.text(rupees(parseFloat(item.price)), c3, y + 4, { width: 65, align: "right" });
    doc.font("Helvetica-Bold").text(rupees(lineTotal), c4, y + 4, { width: 55, align: "right" });

    const rowH = Math.max(22, nameH + cfgH + 8);
    y += rowH;
    doc.moveTo(left, y).lineTo(right, y).strokeColor("#F0EDE8").lineWidth(0.5).stroke();
  }

  y += 10;

  const totalAmount = parseFloat(order.totalAmount);
  const discount = order.discountAmount ? parseFloat(order.discountAmount) : 0;
  const codCharge = isCOD ? 49 : 0;
  const subtotal = totalAmount + discount - codCharge;

  const sumX = c3;
  const sumValX = c4;

  doc.font("Helvetica").fontSize(13).fillColor(mutedColor).text("Subtotal:", sumX, y, { width: 65, align: "right" });
  doc.font("Helvetica").fontSize(13).fillColor(textColor).text(rupees(subtotal), sumValX, y, { width: 55, align: "right" });
  y += 18;

  if (discount > 0) {
    doc.font("Helvetica").fontSize(13).fillColor(mutedColor).text("Discount:", sumX, y, { width: 65, align: "right" });
    doc.font("Helvetica").fontSize(13).fillColor("#2E7D32").text(`-${rupees(discount)}`, sumValX, y, { width: 55, align: "right" });
    y += 18;
  }

  doc.font("Helvetica").fontSize(13).fillColor(mutedColor).text("Shipping:", sumX, y, { width: 65, align: "right" });
  doc.font("Helvetica").fontSize(13).fillColor(textColor).text("FREE", sumValX, y, { width: 55, align: "right" });
  y += 18;

  if (codCharge > 0) {
    doc.font("Helvetica").fontSize(13).fillColor(mutedColor).text("COD Charges:", sumX, y, { width: 65, align: "right" });
    doc.font("Helvetica").fontSize(13).fillColor(textColor).text(rupees(codCharge), sumValX, y, { width: 55, align: "right" });
    y += 18;
  }

  doc.moveTo(sumX, y).lineTo(right, y).strokeColor(brandColor).lineWidth(1).stroke();
  y += 6;

  doc.font("Helvetica-Bold").fontSize(16).fillColor(brandColor).text("Total:", sumX, y, { width: 65, align: "right" });
  doc.font("Helvetica-Bold").fontSize(16).fillColor(brandColor).text(rupees(totalAmount), sumValX, y, { width: 55, align: "right" });

  y += 32;
  doc.font("Helvetica").fontSize(12).fillColor(brandColor)
    .text("Thank you for shopping with Zayelle!", left, y, { width: contentW, align: "center" });
  doc.font("Helvetica").fontSize(11).fillColor(mutedColor)
    .text("www.zayelle.in  |  @zayelle.in", left, y + 18, { width: contentW, align: "center" });
}

export function generateInvoicePDF(order: OrderData): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: "A4", margin: 0, autoFirstPage: true, bufferPages: false });

  const pageWidth = doc.page.width;
  const marginX = 36;
  const marginY = 40;
  const usableW = pageWidth - 2 * marginX;

  renderInvoice(doc, order, marginX, marginY, usableW, "CUSTOMER COPY");

  doc.addPage();
  renderInvoice(doc, order, marginX, marginY, usableW, "MERCHANT COPY");

  return doc;
}
