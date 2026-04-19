import PDFDocument from "pdfkit";
import path from "path";
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

const FONT_REGULAR = path.join(process.cwd(), "src/fonts/NotoSans-Regular.ttf");
const FONT_BOLD    = path.join(process.cwd(), "src/fonts/NotoSans-Bold.ttf");

function rupees(amount: number): string {
  return `\u20b9${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

const BRAND   = "#5C4B3D";
const BLACK   = "#1A1A1A";
const MUTED   = "#757575";
const DIVIDER = "#E8E4DE";
const GREEN   = "#2E7D32";

export function generateInvoicePDF(order: OrderData): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: "A4", margin: 0, autoFirstPage: true, bufferPages: false });

  doc.registerFont("Regular", FONT_REGULAR);
  doc.registerFont("Bold",    FONT_BOLD);

  const PW  = doc.page.width;
  const ML  = 50;
  const MR  = 50;
  const CW  = PW - ML - MR;
  let   y   = 50;

  // ──────────────────────────────────────────
  // HEADER: ZAYELLE  ·  INVOICE
  // ──────────────────────────────────────────
  doc.font("Bold").fontSize(22).fillColor(BRAND).text("ZAYELLE", ML, y);
  doc.font("Regular").fontSize(7.5).fillColor(MUTED)
     .text("PREMIUM HIJABS & MODEST ACCESSORIES", ML, y + 27, { characterSpacing: 0.6 });

  doc.font("Bold").fontSize(18).fillColor(BLACK)
     .text("INVOICE", ML, y, { width: CW, align: "right" });
  doc.font("Regular").fontSize(9.5).fillColor(MUTED)
     .text(`#${order.orderId}`, ML, y + 25, { width: CW, align: "right" });

  y += 50;

  // ──────────────────────────────────────────
  // FULL-WIDTH SEPARATOR
  // ──────────────────────────────────────────
  doc.moveTo(ML, y).lineTo(ML + CW, y).strokeColor(DIVIDER).lineWidth(0.75).stroke();
  y += 20;

  // ──────────────────────────────────────────
  // BILL TO  |  INVOICE DETAILS
  // ──────────────────────────────────────────
  const leftW  = CW * 0.52;
  const rightX = ML + CW * 0.52 + 16;
  const rightW = CW - CW * 0.52 - 16;

  doc.font("Bold").fontSize(7.5).fillColor(MUTED)
     .text("BILL TO", ML, y, { characterSpacing: 0.8 });
  doc.font("Bold").fontSize(7.5).fillColor(MUTED)
     .text("INVOICE DETAILS", rightX, y, { width: rightW, align: "right", characterSpacing: 0.8 });

  y += 13;
  const billStartY = y;

  doc.font("Bold").fontSize(11).fillColor(BLACK)
     .text(order.customerName, ML, y, { width: leftW });
  y += 16;
  doc.font("Regular").fontSize(9).fillColor(MUTED)
     .text(order.customerEmail, ML, y, { width: leftW });
  y += 13;
  if (order.customerPhone) {
    doc.font("Regular").fontSize(9).fillColor(MUTED)
       .text(order.customerPhone, ML, y, { width: leftW });
    y += 13;
  }
  if (order.shippingAddress) {
    doc.font("Regular").fontSize(9).fillColor(MUTED)
       .text(order.shippingAddress, ML, y, { width: leftW - 10 });
    const addrH = doc.heightOfString(order.shippingAddress, { width: leftW - 10 });
    y += addrH + 4;
  }

  const billEndY = y;

  const isCOD = (order.paymentMethod || "").toLowerCase().includes("cod") ||
                (order.paymentMethod || "").toLowerCase().includes("cash");
  const payStatusText = order.paymentStatus === "paid"
    ? "Paid"
    : isCOD ? "Payable on Delivery" : order.paymentStatus;

  const detailRows: { label: string; value: string }[] = [
    { label: "Invoice Date:", value: formatDate(order.createdAt) },
    { label: "Order ID:",     value: order.orderId },
    { label: "Payment:",      value: payStatusText },
    ...(order.paymentMethod ? [{ label: "Method:", value: order.paymentMethod }] : []),
  ];

  let detY = billStartY;
  const labelW = 80;
  const valW   = rightW - labelW;

  for (const row of detailRows) {
    doc.font("Regular").fontSize(9).fillColor(MUTED)
       .text(row.label, rightX, detY, { width: labelW });
    doc.font("Regular").fontSize(9).fillColor(row.label === "Payment:" ? (payStatusText === "Paid" ? GREEN : "#E65100") : BLACK)
       .text(row.value, rightX + labelW, detY, { width: valW, align: "right" });
    detY += 15;
  }

  y = Math.max(billEndY, detY) + 18;

  // ──────────────────────────────────────────
  // FULL-WIDTH SEPARATOR
  // ──────────────────────────────────────────
  doc.moveTo(ML, y).lineTo(ML + CW, y).strokeColor(DIVIDER).lineWidth(0.5).stroke();
  y += 14;

  // ──────────────────────────────────────────
  // TABLE HEADER
  // ──────────────────────────────────────────
  const colNum   = { x: ML,              w: 22  };
  const colAmt   = { x: ML + CW - 85,   w: 85  };
  const colPrice = { x: ML + CW - 175,  w: 85  };
  const colQty   = { x: ML + CW - 255,  w: 75  };
  const colName  = { x: ML + 22,        w: CW - 22 - 75 - 85 - 85 - 5 };

  doc.font("Bold").fontSize(7.5).fillColor(MUTED);
  doc.text("#",          colNum.x,   y, { width: colNum.w });
  doc.text("PRODUCT",    colName.x,  y, { width: colName.w });
  doc.text("QTY",        colQty.x,   y, { width: colQty.w,   align: "center" });
  doc.text("UNIT PRICE", colPrice.x, y, { width: colPrice.w, align: "right" });
  doc.text("AMOUNT",     colAmt.x,   y, { width: colAmt.w,   align: "right" });

  y += 10;
  doc.moveTo(ML, y).lineTo(ML + CW, y).strokeColor(BLACK).lineWidth(1).stroke();
  y += 12;

  // ──────────────────────────────────────────
  // TABLE ROWS
  // ──────────────────────────────────────────
  for (let i = 0; i < order.items.length; i++) {
    const item      = order.items[i];
    const lineTotal = item.quantity * parseFloat(item.price);
    const cfgLines  = getItemConfigLines(item);

    const nameH = doc.font("Regular").fontSize(9)
                     .heightOfString(item.productName, { width: colName.w });

    let cfgH = 0;
    let cfgText = "";
    if (cfgLines.length > 0) {
      cfgText = cfgLines.join("\n");
      cfgH = doc.font("Regular").fontSize(8)
                .heightOfString(cfgText, { width: colName.w - 8 }) + 3;
    }

    const rowH = Math.max(24, nameH + cfgH + 10);

    doc.font("Regular").fontSize(9).fillColor(MUTED)
       .text(String(i + 1), colNum.x, y + 1, { width: colNum.w });

    doc.font("Regular").fontSize(9).fillColor(BLACK)
       .text(item.productName, colName.x, y + 1, { width: colName.w });

    if (cfgLines.length > 0) {
      doc.font("Regular").fontSize(8).fillColor(MUTED)
         .text(cfgText, colName.x + 8, y + 1 + nameH + 2, { width: colName.w - 8 });
    }

    doc.font("Regular").fontSize(9).fillColor(BLACK)
       .text(String(item.quantity), colQty.x, y + 1, { width: colQty.w, align: "center" });
    doc.font("Regular").fontSize(9).fillColor(BLACK)
       .text(rupees(parseFloat(item.price)), colPrice.x, y + 1, { width: colPrice.w, align: "right" });
    doc.font("Regular").fontSize(9).fillColor(BLACK)
       .text(rupees(lineTotal), colAmt.x, y + 1, { width: colAmt.w, align: "right" });

    y += rowH;
    doc.moveTo(ML, y).lineTo(ML + CW, y).strokeColor(DIVIDER).lineWidth(0.4).stroke();
    y += 8;
  }

  y += 8;

  // ──────────────────────────────────────────
  // TOTALS (right-aligned)
  // ──────────────────────────────────────────
  const subtotal     = order.items.reduce((s, it) => s + parseFloat(it.price) * it.quantity, 0);
  const discount     = order.discountAmount ? parseFloat(order.discountAmount) : 0;
  const totalAmount  = parseFloat(order.totalAmount);
  const sumLabelX    = colPrice.x;
  const sumValX      = colAmt.x;
  const sumLabelW    = colPrice.w;
  const sumValW      = colAmt.w;

  doc.font("Regular").fontSize(9).fillColor(MUTED)
     .text("Subtotal", sumLabelX, y, { width: sumLabelW, align: "right" });
  doc.font("Regular").fontSize(9).fillColor(BLACK)
     .text(rupees(subtotal), sumValX, y, { width: sumValW, align: "right" });
  y += 15;

  if (discount > 0) {
    const discLabel = order.couponCode ? `Discount (${order.couponCode})` : "Discount";
    const discLabelX  = ML + 80;
    const discLabelW  = sumLabelX - ML - 80 + sumLabelW;
    doc.font("Regular").fontSize(9).fillColor(MUTED)
       .text(discLabel, discLabelX, y, { width: discLabelW, align: "right" });
    doc.font("Regular").fontSize(9).fillColor(GREEN)
       .text(`-${rupees(discount)}`, sumValX, y, { width: sumValW, align: "right" });
    y += 15;
  }

  doc.font("Regular").fontSize(9).fillColor(MUTED)
     .text("Shipping", sumLabelX, y, { width: sumLabelW, align: "right" });
  doc.font("Regular").fontSize(9).fillColor(BLACK)
     .text("Free", sumValX, y, { width: sumValW, align: "right" });
  y += 15;

  doc.moveTo(ML + CW * 0.45, y).lineTo(ML + CW, y).strokeColor(DIVIDER).lineWidth(0.5).stroke();
  y += 8;

  doc.font("Bold").fontSize(11).fillColor(BLACK)
     .text("TOTAL", sumLabelX, y, { width: sumLabelW, align: "right" });
  doc.font("Bold").fontSize(11).fillColor(BLACK)
     .text(rupees(totalAmount), sumValX, y, { width: sumValW, align: "right" });
  y += 32;

  // ──────────────────────────────────────────
  // DIVIDER before notes
  // ──────────────────────────────────────────
  doc.moveTo(ML, y).lineTo(ML + CW, y).strokeColor(DIVIDER).lineWidth(0.5).stroke();
  y += 14;

  // ──────────────────────────────────────────
  // NOTES  |  SHIPPING ADDRESS
  // ──────────────────────────────────────────
  const noteW  = CW * 0.52;
  const addrX  = ML + CW * 0.52 + 16;
  const addrWN = CW - CW * 0.52 - 16;

  doc.font("Bold").fontSize(7.5).fillColor(MUTED)
     .text("NOTES", ML, y, { characterSpacing: 0.5 });
  doc.font("Bold").fontSize(7.5).fillColor(MUTED)
     .text("SHIPPING ADDRESS", addrX, y, { width: addrWN, characterSpacing: 0.5 });
  y += 12;

  doc.font("Regular").fontSize(8).fillColor(MUTED)
     .text(
       "Thank you for shopping with Zayelle. We hope you love your purchase! " +
       "For any queries, please contact us at zayelle.in@gmail.com",
       ML, y, { width: noteW }
     );
  if (order.shippingAddress) {
    doc.font("Regular").fontSize(8).fillColor(MUTED)
       .text(order.shippingAddress, addrX, y, { width: addrWN });
  }

  // ──────────────────────────────────────────
  // FOOTER (pinned near bottom)
  // ──────────────────────────────────────────
  const footY = doc.page.height - 48;
  doc.moveTo(ML, footY - 10).lineTo(ML + CW, footY - 10).strokeColor(DIVIDER).lineWidth(0.5).stroke();
  doc.font("Regular").fontSize(8).fillColor(MUTED)
     .text("ZAYELLE \u2014 PREMIUM HIJABS & MODEST ACCESSORIES", ML, footY, { width: CW, align: "center", characterSpacing: 0.4 });
  doc.font("Regular").fontSize(8).fillColor(MUTED)
     .text("www.zayelle.in", ML, footY + 13, { width: CW, align: "center" });

  return doc;
}
