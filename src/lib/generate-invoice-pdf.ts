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
  return `\u20B9${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function generateInvoicePDF(order: OrderData): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: "A4", margin: 0, autoFirstPage: true, bufferPages: false });

  const PW = doc.page.width;
  const ML = 48;
  const MR = 48;
  const contentW = PW - ML - MR;
  const right = PW - MR;

  const black = "#1A1A1A";
  const muted = "#888888";
  const divider = "#CCCCCC";
  const green = "#2E7D32";

  let y = 44;

  doc.font("Helvetica-Bold").fontSize(26).fillColor(black).text("ZAYELLE", ML, y);
  doc.font("Helvetica").fontSize(9).fillColor(muted).text("PREMIUM HIJABS & MODEST ACCESSORIES", ML, y + 31);

  doc.font("Helvetica-Bold").fontSize(26).fillColor(black).text("INVOICE", right - 200, y, { width: 200, align: "right" });
  doc.font("Helvetica").fontSize(9).fillColor(muted).text(`#${order.orderId}`, right - 200, y + 31, { width: 200, align: "right" });

  y += 56;
  doc.moveTo(ML, y).lineTo(right, y).strokeColor(divider).lineWidth(0.75).stroke();
  y += 20;

  const halfW = contentW / 2 - 10;

  doc.font("Helvetica-Bold").fontSize(7).fillColor(muted).text("BILL TO", ML, y);
  doc.font("Helvetica-Bold").fontSize(7).fillColor(muted).text("INVOICE DETAILS", right, y, { width: 200, align: "right" });
  y += 13;

  const billStartY = y;

  doc.font("Helvetica-Bold").fontSize(11).fillColor(black).text(order.customerName, ML, y, { width: halfW });
  y += 16;
  doc.font("Helvetica").fontSize(9).fillColor(muted).text(order.customerEmail, ML, y, { width: halfW });
  y += 13;
  if (order.customerPhone) {
    doc.font("Helvetica").fontSize(9).fillColor(muted).text(order.customerPhone, ML, y, { width: halfW });
    y += 13;
  }
  if (order.shippingAddress) {
    doc.font("Helvetica").fontSize(9).fillColor(muted).text(order.shippingAddress, ML, y, { width: halfW });
  }

  const isCOD = (order.paymentMethod || "").toLowerCase().includes("cod");
  const payStatusText = isCOD ? "Payable on Delivery" : (order.paymentStatus === "paid" ? "Paid" : order.paymentStatus);
  const payStatusColor = payStatusText === "Paid" ? green : (payStatusText === "Payable on Delivery" ? "#E65100" : black);

  const detailLabelX = right - 200;
  const detailValueX = right - 95;
  const detailValueW = 95;

  let dy = billStartY;
  const detailRows: { label: string; value: string; valueColor?: string; bold?: boolean }[] = [
    { label: "Invoice Date:", value: formatDate(order.createdAt) },
    { label: "Order ID:", value: order.orderId, bold: true },
    { label: "Payment:", value: payStatusText, valueColor: payStatusColor, bold: true },
    { label: "Method:", value: order.paymentMethod || "—" },
  ];

  for (const row of detailRows) {
    doc.font("Helvetica").fontSize(9).fillColor(muted).text(row.label, detailLabelX, dy, { width: 100, align: "right" });
    doc.font(row.bold ? "Helvetica-Bold" : "Helvetica").fontSize(9).fillColor(row.valueColor || black)
      .text(row.value, detailValueX, dy, { width: detailValueW, align: "right" });
    dy += 16;
  }

  y = Math.max(y + 20, dy + 8);

  doc.moveTo(ML, y).lineTo(right, y).strokeColor(divider).lineWidth(0.75).stroke();
  y += 14;

  const colNum = ML + 8;
  const colProduct = ML + 28;
  const colQty = right - 220;
  const colUnit = right - 130;
  const colAmount = right;

  doc.font("Helvetica-Bold").fontSize(7.5).fillColor(muted);
  doc.text("#", colNum, y, { width: 20 });
  doc.text("PRODUCT", colProduct, y, { width: colQty - colProduct - 8 });
  doc.text("QTY", colQty, y, { width: 60, align: "center" });
  doc.text("UNIT PRICE", colUnit, y, { width: 80, align: "right" });
  doc.text("AMOUNT", colAmount - 80, y, { width: 80, align: "right" });

  y += 10;
  doc.moveTo(ML, y).lineTo(right, y).strokeColor(black).lineWidth(1).stroke();
  y += 12;

  const totalAmount = parseFloat(order.totalAmount);
  const discount = order.discountAmount ? parseFloat(order.discountAmount) : 0;
  const codCharge = isCOD ? 49 : 0;
  const subtotal = totalAmount + discount - codCharge;

  let itemSubtotal = 0;
  for (let i = 0; i < order.items.length; i++) {
    const item = order.items[i];
    const unitPrice = parseFloat(item.price);
    const lineTotal = item.quantity * unitPrice;
    itemSubtotal += lineTotal;
    const cfgLines = getItemConfigLines(item);
    const productW = colQty - colProduct - 8;

    doc.font("Helvetica").fontSize(8).fillColor(muted).text(String(i + 1), colNum, y, { width: 20 });

    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(black).text(item.productName, colProduct, y, { width: productW });
    const nameH = doc.heightOfString(item.productName, { width: productW });

    let cfgH = 0;
    if (cfgLines.length > 0) {
      for (const line of cfgLines) {
        doc.font("Helvetica").fontSize(8).fillColor(muted);
        const parts = line.split(": ");
        if (parts.length === 2) {
          const dotText = `\u25CF ${parts[0]}: ${parts[1]}`;
          doc.text(dotText, colProduct, y + nameH + cfgH, { width: productW });
          cfgH += doc.heightOfString(dotText, { width: productW });
        } else {
          doc.text(line, colProduct, y + nameH + cfgH, { width: productW });
          cfgH += doc.heightOfString(line, { width: productW });
        }
      }
    }

    const rowH = Math.max(nameH + cfgH + 4, 20);

    doc.font("Helvetica").fontSize(9.5).fillColor(black)
      .text(String(item.quantity), colQty, y, { width: 60, align: "center" });
    doc.font("Helvetica").fontSize(9.5).fillColor(black)
      .text(rupees(unitPrice), colUnit, y, { width: 80, align: "right" });
    doc.font("Helvetica").fontSize(9.5).fillColor(black)
      .text(rupees(lineTotal), colAmount - 80, y, { width: 80, align: "right" });

    y += rowH;
    doc.moveTo(ML, y).lineTo(right, y).strokeColor("#EEEEEE").lineWidth(0.5).stroke();
    y += 10;
  }

  y += 12;

  const sumLabelX = right - 220;
  const sumValX = right - 80;
  const sumLabelW = 130;
  const sumValW = 80;

  doc.font("Helvetica").fontSize(9.5).fillColor(muted).text("Subtotal", sumLabelX, y, { width: sumLabelW, align: "right" });
  doc.font("Helvetica").fontSize(9.5).fillColor(black).text(rupees(subtotal), sumValX, y, { width: sumValW, align: "right" });
  y += 16;

  if (discount > 0) {
    const discLabel = order.couponCode ? `Discount (${order.couponCode})` : "Discount";
    doc.font("Helvetica").fontSize(9.5).fillColor(muted).text(discLabel, sumLabelX, y, { width: sumLabelW, align: "right" });
    doc.font("Helvetica").fontSize(9.5).fillColor(green).text(`-${rupees(discount)}`, sumValX, y, { width: sumValW, align: "right" });
    y += 16;
  }

  const shippingCharge = subtotal - discount >= 1000 ? 0 : 55;
  doc.font("Helvetica").fontSize(9.5).fillColor(muted).text("Shipping", sumLabelX, y, { width: sumLabelW, align: "right" });
  doc.font("Helvetica").fontSize(9.5).fillColor(black)
    .text(shippingCharge === 0 ? "Free" : rupees(shippingCharge), sumValX, y, { width: sumValW, align: "right" });
  y += 16;

  if (codCharge > 0) {
    doc.font("Helvetica").fontSize(9.5).fillColor(muted).text("COD Charges", sumLabelX, y, { width: sumLabelW, align: "right" });
    doc.font("Helvetica").fontSize(9.5).fillColor(black).text(rupees(codCharge), sumValX, y, { width: sumValW, align: "right" });
    y += 16;
  }

  y += 4;
  doc.moveTo(ML, y).lineTo(right, y).strokeColor(divider).lineWidth(0.75).stroke();
  y += 12;

  doc.font("Helvetica-Bold").fontSize(12).fillColor(black).text("TOTAL", sumLabelX, y, { width: sumLabelW, align: "right" });
  doc.font("Helvetica-Bold").fontSize(14).fillColor(black).text(rupees(totalAmount), sumValX, y - 2, { width: sumValW, align: "right" });
  y += 28;

  doc.moveTo(ML, y).lineTo(right, y).strokeColor(divider).lineWidth(0.75).stroke();
  y += 20;

  const notesW = contentW / 2 - 12;
  doc.font("Helvetica-Bold").fontSize(7.5).fillColor(muted).text("NOTES", ML, y);
  doc.font("Helvetica-Bold").fontSize(7.5).fillColor(muted).text("SHIPPING ADDRESS", right, y, { width: 200, align: "right" });
  y += 13;

  doc.font("Helvetica").fontSize(8.5).fillColor(muted)
    .text(
      "Thank you for shopping with Zayelle. We hope you love your purchase! For any queries, please contact us at zayelle.in@gmail.com",
      ML,
      y,
      { width: notesW }
    );

  if (order.shippingAddress) {
    doc.font("Helvetica").fontSize(8.5).fillColor(muted)
      .text(order.shippingAddress, ML + notesW + 24, y, { width: notesW });
  }

  const footerY = doc.page.height - 40;
  doc.moveTo(ML, footerY - 12).lineTo(right, footerY - 12).strokeColor(divider).lineWidth(0.75).stroke();
  doc.font("Helvetica").fontSize(8).fillColor(muted)
    .text("ZAYELLE \u2014 PREMIUM HIJABS & MODEST ACCESSORIES", ML, footerY, { width: contentW, align: "center" });
  doc.font("Helvetica").fontSize(8).fillColor(muted)
    .text("www.zayelle.in", ML, footerY + 12, { width: contentW, align: "center" });

  return doc;
}
