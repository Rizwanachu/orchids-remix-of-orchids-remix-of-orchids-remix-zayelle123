import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

interface OrderItem {
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
  createdAt: Date;
  items: OrderItem[];
}

export function generateInvoicePDF(order: OrderData): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  const brandColor = "#5C4B3D";
  const textColor = "#1A1A1A";
  const mutedColor = "#757575";
  const lineColor = "#E8E4DE";
  const pageWidth = doc.page.width;
  const contentWidth = pageWidth - 100;

  const orderYear = new Date(order.createdAt).getFullYear();
  const invoiceNumber = `INV-${orderYear}-${order.orderId}`;
  const invoiceDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const logoPath = path.join(process.cwd(), "public", "logo.png");
  const hasLogo = fs.existsSync(logoPath);

  if (hasLogo) {
    doc.image(logoPath, 50, 40, { width: 80 });
  }

  const headerX = hasLogo ? 140 : 50;
  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor(brandColor)
    .text("ZAYELLE", headerX, 45);
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(mutedColor)
    .text("Premium Hijabs & Modest Accessories", headerX, 70);

  doc
    .font("Helvetica-Bold")
    .fontSize(28)
    .fillColor(brandColor)
    .text("INVOICE", pageWidth - 200, 45, { width: 150, align: "right" });

  doc.moveTo(50, 105).lineTo(pageWidth - 50, 105).strokeColor(lineColor).lineWidth(1).stroke();

  let y = 120;

  doc.font("Helvetica-Bold").fontSize(9).fillColor(mutedColor).text("INVOICE NUMBER", 50, y);
  doc.font("Helvetica").fontSize(10).fillColor(textColor).text(invoiceNumber, 50, y + 14);

  doc.font("Helvetica-Bold").fontSize(9).fillColor(mutedColor).text("DATE", 250, y);
  doc.font("Helvetica").fontSize(10).fillColor(textColor).text(invoiceDate, 250, y + 14);

  doc.font("Helvetica-Bold").fontSize(9).fillColor(mutedColor).text("ORDER ID", pageWidth - 200, y, { width: 150, align: "right" });
  doc.font("Helvetica").fontSize(10).fillColor(textColor).text(order.orderId, pageWidth - 200, y + 14, { width: 150, align: "right" });

  y += 50;
  doc.moveTo(50, y).lineTo(pageWidth - 50, y).strokeColor(lineColor).lineWidth(0.5).stroke();

  y += 15;

  const isPrepaid = order.paymentMethod?.toLowerCase() === "prepaid";
  const isCOD = order.paymentMethod?.toLowerCase() === "cod" || order.paymentMethod?.toLowerCase() === "cash on delivery";

  doc.font("Helvetica-Bold").fontSize(11).fillColor(brandColor).text("Payment Details", 50, y);
  y += 18;

  doc.font("Helvetica-Bold").fontSize(9).fillColor(mutedColor).text("Payment Method:", 50, y);
  doc.font("Helvetica").fontSize(10).fillColor(textColor).text(
    isPrepaid ? "Prepaid" : isCOD ? "Cash on Delivery" : (order.paymentMethod || "N/A"),
    160, y
  );
  y += 16;

  doc.font("Helvetica-Bold").fontSize(9).fillColor(mutedColor).text("Payment Status:", 50, y);
  const paymentStatusText = isPrepaid ? "Paid" : isCOD ? "Payable on Delivery" : order.paymentStatus;
  const statusColor = paymentStatusText === "Paid" ? "#2E7D32" : "#E65100";
  doc.font("Helvetica-Bold").fontSize(10).fillColor(statusColor).text(paymentStatusText, 160, y);

  y += 30;
  doc.moveTo(50, y).lineTo(pageWidth - 50, y).strokeColor(lineColor).lineWidth(0.5).stroke();
  y += 15;

  doc.font("Helvetica-Bold").fontSize(11).fillColor(brandColor).text("Customer Details", 50, y);
  y += 18;

  const details = [
    { label: "Name:", value: order.customerName },
    { label: "Email:", value: order.customerEmail },
    { label: "Phone:", value: order.customerPhone || "N/A" },
  ];

  for (const detail of details) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor(mutedColor).text(detail.label, 50, y);
    doc.font("Helvetica").fontSize(10).fillColor(textColor).text(detail.value, 160, y);
    y += 16;
  }

  if (order.shippingAddress) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor(mutedColor).text("Shipping Address:", 50, y);
    doc.font("Helvetica").fontSize(10).fillColor(textColor).text(order.shippingAddress, 160, y, { width: contentWidth - 110 });
    const addressHeight = doc.heightOfString(order.shippingAddress, { width: contentWidth - 110 });
    y += Math.max(16, addressHeight + 4);
  }

  y += 15;
  doc.moveTo(50, y).lineTo(pageWidth - 50, y).strokeColor(lineColor).lineWidth(0.5).stroke();
  y += 15;

  doc.font("Helvetica-Bold").fontSize(11).fillColor(brandColor).text("Order Items", 50, y);
  y += 20;

  const col1 = 50;
  const col2 = 300;
  const col3 = 380;
  const col4 = 460;

  doc.rect(50, y, contentWidth, 22).fill("#F5F2ED");
  doc.font("Helvetica-Bold").fontSize(9).fillColor(mutedColor);
  doc.text("PRODUCT", col1 + 8, y + 6);
  doc.text("QTY", col2, y + 6, { width: 60, align: "center" });
  doc.text("UNIT PRICE", col3, y + 6, { width: 70, align: "right" });
  doc.text("TOTAL", col4, y + 6, { width: 85, align: "right" });
  y += 22;

  for (const item of order.items) {
    if (y > 700) {
      doc.addPage();
      y = 50;
    }

    const lineTotal = item.quantity * parseFloat(item.price);

    doc.font("Helvetica").fontSize(10).fillColor(textColor);
    doc.text(item.productName, col1 + 8, y + 6, { width: 240 });
    const nameHeight = doc.heightOfString(item.productName, { width: 240 });
    doc.text(String(item.quantity), col2, y + 6, { width: 60, align: "center" });
    doc.text(`₹${parseFloat(item.price).toLocaleString("en-IN")}`, col3, y + 6, { width: 70, align: "right" });
    doc.font("Helvetica-Bold").text(`₹${lineTotal.toLocaleString("en-IN")}`, col4, y + 6, { width: 85, align: "right" });

    const rowHeight = Math.max(20, nameHeight + 12);
    y += rowHeight;

    doc.moveTo(50, y).lineTo(pageWidth - 50, y).strokeColor("#F0EDE8").lineWidth(0.5).stroke();
  }

  y += 15;

  const totalAmount = parseFloat(order.totalAmount);
  const discount = order.discountAmount ? parseFloat(order.discountAmount) : 0;
  const subtotal = totalAmount + discount;

  const summaryX = col3;
  const summaryValueX = col4;

  doc.font("Helvetica").fontSize(10).fillColor(mutedColor).text("Subtotal:", summaryX, y, { width: 70, align: "right" });
  doc.font("Helvetica").fillColor(textColor).text(`₹${subtotal.toLocaleString("en-IN")}`, summaryValueX, y, { width: 85, align: "right" });
  y += 18;

  if (discount > 0) {
    doc.font("Helvetica").fontSize(10).fillColor(mutedColor).text("Discount:", summaryX, y, { width: 70, align: "right" });
    doc.font("Helvetica").fillColor("#2E7D32").text(`-₹${discount.toLocaleString("en-IN")}`, summaryValueX, y, { width: 85, align: "right" });
    y += 18;

    if (order.couponCode) {
      doc.font("Helvetica").fontSize(8).fillColor(mutedColor).text(`(${order.couponCode})`, summaryValueX, y - 4, { width: 85, align: "right" });
      y += 12;
    }
  }

  doc.font("Helvetica").fontSize(10).fillColor(mutedColor).text("Shipping:", summaryX, y, { width: 70, align: "right" });
  doc.font("Helvetica").fillColor(textColor).text("FREE", summaryValueX, y, { width: 85, align: "right" });
  y += 20;

  doc.moveTo(summaryX, y).lineTo(pageWidth - 50, y).strokeColor(brandColor).lineWidth(1).stroke();
  y += 8;

  doc.font("Helvetica-Bold").fontSize(13).fillColor(brandColor).text("Total:", summaryX, y, { width: 70, align: "right" });
  doc.font("Helvetica-Bold").fontSize(13).fillColor(brandColor).text(`₹${totalAmount.toLocaleString("en-IN")}`, summaryValueX, y, { width: 85, align: "right" });

  const footerY = doc.page.height - 80;

  doc.moveTo(50, footerY).lineTo(pageWidth - 50, footerY).strokeColor(lineColor).lineWidth(0.5).stroke();

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(brandColor)
    .text("Thank you for shopping with Zayelle!", 50, footerY + 15, { width: contentWidth, align: "center" });

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(mutedColor)
    .text("Premium Hijabs & Modest Accessories — Gracefully designed for modern women across India.", 50, footerY + 32, { width: contentWidth, align: "center" });

  doc
    .font("Helvetica")
    .fontSize(7)
    .fillColor(mutedColor)
    .text("www.zayelle.in | @zayelle.in", 50, footerY + 48, { width: contentWidth, align: "center" });

  return doc;
}
