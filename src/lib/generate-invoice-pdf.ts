import PDFDocument from "pdfkit";

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

function rupees(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function generateInvoicePDF(order: OrderData): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: "A4", margin: 50, autoFirstPage: true, bufferPages: false });

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

  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor(brandColor)
    .text("ZAYELLE", 50, 45);
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(mutedColor)
    .text("Premium Hijabs & Modest Accessories", 50, 70);

  doc
    .font("Helvetica-Bold")
    .fontSize(24)
    .fillColor(brandColor)
    .text("INVOICE", pageWidth - 200, 48, { width: 150, align: "right" });

  doc.moveTo(50, 95).lineTo(pageWidth - 50, 95).strokeColor(lineColor).lineWidth(1).stroke();

  let y = 108;

  doc.font("Helvetica-Bold").fontSize(8).fillColor(mutedColor).text("INVOICE NUMBER", 50, y);
  doc.font("Helvetica").fontSize(9).fillColor(textColor).text(invoiceNumber, 50, y + 12);

  doc.font("Helvetica-Bold").fontSize(8).fillColor(mutedColor).text("DATE", 230, y);
  doc.font("Helvetica").fontSize(9).fillColor(textColor).text(invoiceDate, 230, y + 12);

  doc.font("Helvetica-Bold").fontSize(8).fillColor(mutedColor).text("ORDER ID", pageWidth - 200, y, { width: 150, align: "right" });
  doc.font("Helvetica").fontSize(9).fillColor(textColor).text(order.orderId, pageWidth - 200, y + 12, { width: 150, align: "right" });

  y += 38;
  doc.moveTo(50, y).lineTo(pageWidth - 50, y).strokeColor(lineColor).lineWidth(0.5).stroke();

  y += 10;

  const isPrepaid = order.paymentMethod?.toLowerCase() === "prepaid";
  const isCOD = order.paymentMethod?.toLowerCase() === "cod" || order.paymentMethod?.toLowerCase() === "cash on delivery";

  doc.font("Helvetica-Bold").fontSize(10).fillColor(brandColor).text("Payment Details", 50, y);
  y += 14;

  doc.font("Helvetica-Bold").fontSize(8).fillColor(mutedColor).text("Payment Method:", 50, y);
  doc.font("Helvetica").fontSize(9).fillColor(textColor).text(
    isPrepaid ? "Prepaid" : isCOD ? "Cash on Delivery" : (order.paymentMethod || "N/A"),
    150, y
  );
  y += 14;

  doc.font("Helvetica-Bold").fontSize(8).fillColor(mutedColor).text("Payment Status:", 50, y);
  const paymentStatusText = isPrepaid ? "Paid" : isCOD ? "Payable on Delivery" : order.paymentStatus;
  const statusColor = paymentStatusText === "Paid" ? "#2E7D32" : "#E65100";
  doc.font("Helvetica-Bold").fontSize(9).fillColor(statusColor).text(paymentStatusText, 150, y);

  y += 22;
  doc.moveTo(50, y).lineTo(pageWidth - 50, y).strokeColor(lineColor).lineWidth(0.5).stroke();
  y += 10;

  doc.font("Helvetica-Bold").fontSize(10).fillColor(brandColor).text("Customer Details", 50, y);
  y += 14;

  const details = [
    { label: "Name:", value: order.customerName },
    { label: "Email:", value: order.customerEmail },
    { label: "Phone:", value: order.customerPhone || "N/A" },
  ];

  for (const detail of details) {
    doc.font("Helvetica-Bold").fontSize(8).fillColor(mutedColor).text(detail.label, 50, y);
    doc.font("Helvetica").fontSize(9).fillColor(textColor).text(detail.value, 150, y);
    y += 14;
  }

  if (order.shippingAddress) {
    doc.font("Helvetica-Bold").fontSize(8).fillColor(mutedColor).text("Shipping Address:", 50, y);
    doc.font("Helvetica").fontSize(9).fillColor(textColor).text(order.shippingAddress, 150, y, { width: contentWidth - 100 });
    const addressHeight = doc.heightOfString(order.shippingAddress, { width: contentWidth - 100 });
    y += Math.max(14, addressHeight + 4);
  }

  y += 10;
  doc.moveTo(50, y).lineTo(pageWidth - 50, y).strokeColor(lineColor).lineWidth(0.5).stroke();
  y += 10;

  doc.font("Helvetica-Bold").fontSize(10).fillColor(brandColor).text("Order Items", 50, y);
  y += 16;

  const col1 = 50;
  const col2 = 310;
  const col3 = 380;
  const col4 = 460;

  doc.rect(50, y, contentWidth, 20).fill("#F5F2ED");
  doc.font("Helvetica-Bold").fontSize(8).fillColor(mutedColor);
  doc.text("PRODUCT", col1 + 8, y + 5);
  doc.text("QTY", col2, y + 5, { width: 50, align: "center" });
  doc.text("UNIT PRICE", col3, y + 5, { width: 70, align: "right" });
  doc.text("TOTAL", col4, y + 5, { width: 85, align: "right" });
  y += 20;

  for (const item of order.items) {
    const lineTotal = item.quantity * parseFloat(item.price);

    doc.font("Helvetica").fontSize(9).fillColor(textColor);
    doc.text(item.productName, col1 + 8, y + 5, { width: 250 });
    const nameHeight = doc.heightOfString(item.productName, { width: 250 });
    doc.text(String(item.quantity), col2, y + 5, { width: 50, align: "center" });
    doc.text(rupees(parseFloat(item.price)), col3, y + 5, { width: 70, align: "right" });
    doc.font("Helvetica-Bold").text(rupees(lineTotal), col4, y + 5, { width: 85, align: "right" });

    const rowHeight = Math.max(18, nameHeight + 10);
    y += rowHeight;

    doc.moveTo(50, y).lineTo(pageWidth - 50, y).strokeColor("#F0EDE8").lineWidth(0.5).stroke();
  }

  y += 12;

  const totalAmount = parseFloat(order.totalAmount);
  const discount = order.discountAmount ? parseFloat(order.discountAmount) : 0;
  const codCharge = isCOD ? 49 : 0;
  const subtotal = totalAmount + discount - codCharge;

  const summaryX = col3;
  const summaryValueX = col4;

  doc.font("Helvetica").fontSize(9).fillColor(mutedColor).text("Subtotal:", summaryX, y, { width: 70, align: "right" });
  doc.font("Helvetica").fillColor(textColor).text(rupees(subtotal), summaryValueX, y, { width: 85, align: "right" });
  y += 15;

  if (discount > 0) {
    doc.font("Helvetica").fontSize(9).fillColor(mutedColor).text("Discount:", summaryX, y, { width: 70, align: "right" });
    doc.font("Helvetica").fillColor("#2E7D32").text(`-${rupees(discount)}`, summaryValueX, y, { width: 85, align: "right" });
    y += 15;

    if (order.couponCode) {
      doc.font("Helvetica").fontSize(7).fillColor(mutedColor).text(`(${order.couponCode})`, summaryValueX, y - 3, { width: 85, align: "right" });
      y += 10;
    }
  }

  doc.font("Helvetica").fontSize(9).fillColor(mutedColor).text("Shipping:", summaryX, y, { width: 70, align: "right" });
  doc.font("Helvetica").fillColor(textColor).text("FREE", summaryValueX, y, { width: 85, align: "right" });
  y += 15;

  if (codCharge > 0) {
    doc.font("Helvetica").fontSize(9).fillColor(mutedColor).text("COD Charges:", summaryX, y, { width: 70, align: "right" });
    doc.font("Helvetica").fillColor(textColor).text(rupees(codCharge), summaryValueX, y, { width: 85, align: "right" });
    y += 16;
  } else {
    y += 1;
  }

  doc.moveTo(summaryX, y).lineTo(pageWidth - 50, y).strokeColor(brandColor).lineWidth(1).stroke();
  y += 6;

  doc.font("Helvetica-Bold").fontSize(12).fillColor(brandColor).text("Total:", summaryX, y, { width: 70, align: "right" });
  doc.font("Helvetica-Bold").fontSize(12).fillColor(brandColor).text(rupees(totalAmount), summaryValueX, y, { width: 85, align: "right" });

  y += 40;

  doc.moveTo(50, y).lineTo(pageWidth - 50, y).strokeColor(lineColor).lineWidth(0.5).stroke();

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(brandColor)
    .text("Thank you for shopping with Zayelle!", 50, y + 12, { width: contentWidth, align: "center" });

  doc
    .font("Helvetica")
    .fontSize(7)
    .fillColor(mutedColor)
    .text("Premium Hijabs & Modest Accessories -- Gracefully designed for modern women across India.", 50, y + 26, { width: contentWidth, align: "center" });

  doc
    .font("Helvetica")
    .fontSize(7)
    .fillColor(mutedColor)
    .text("www.zayelle.in | @zayelle.in", 50, y + 38, { width: contentWidth, align: "center" });

  return doc;
}
