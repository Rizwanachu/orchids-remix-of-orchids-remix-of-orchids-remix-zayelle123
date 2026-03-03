import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || process.env.GMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD,
  },
});

const FROM_EMAIL = process.env.SMTP_FROM || process.env.SMTP_USER || "zayelle.in@gmail.com";

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background-color: #f7f7f7; font-family: 'Helvetica Neue', Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: #000000; padding: 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 4px; font-weight: 300; }
    .content { padding: 32px 24px; color: #333333; line-height: 1.6; }
    .content h2 { color: #000000; font-size: 20px; margin-top: 0; font-weight: 500; }
    .order-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .order-table th { background: #f5f5f5; padding: 10px 12px; text-align: left; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #666; border-bottom: 1px solid #e0e0e0; }
    .order-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
    .total-row td { font-weight: 600; font-size: 15px; border-top: 2px solid #000; }
    .info-box { background: #f9f9f9; border-left: 3px solid #000; padding: 16px; margin: 16px 0; }
    .info-box p { margin: 4px 0; font-size: 14px; }
    .tracking-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 16px 0; text-align: center; }
    .tracking-box .tracking-number { font-size: 20px; font-weight: 700; letter-spacing: 2px; color: #166534; margin: 8px 0; }
    .footer { background: #f5f5f5; padding: 24px; text-align: center; font-size: 12px; color: #999; }
    .footer a { color: #666; text-decoration: none; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
    .badge-processing { background: #fef3c7; color: #92400e; }
    .badge-shipped { background: #dbeafe; color: #1e40af; }
    .badge-paid { background: #d1fae5; color: #065f46; }
    .badge-cod { background: #fef3c7; color: #92400e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ZAYELLE</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Zayelle. All rights reserved.</p>
      <p>If you have questions about your order, please contact us.</p>
    </div>
  </div>
</body>
</html>`;
}

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  shippingAddress?: string | null;
  totalAmount: string;
  paymentMethod?: string | null;
  paymentStatus?: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: string;
    image?: string | null;
  }>;
  couponCode?: string | null;
  discountAmount?: string | null;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (!smtpUser || !smtpPass) {
    console.log("Email not configured - skipping order confirmation email");
    return;
  }

  const isCOD = false;

  const itemsHtml = data.items.map(item => `
    <tr>
      <td>${item.productName}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:right">₹${parseFloat(item.price).toLocaleString("en-IN")}</td>
    </tr>
  `).join("");

  const discountHtml = data.discountAmount && parseFloat(data.discountAmount) > 0 ? `
    <tr>
      <td colspan="2" style="text-align:right; color:#059669;">Discount${data.couponCode ? ` (${data.couponCode})` : ""}</td>
      <td style="text-align:right; color:#059669;">-₹${parseFloat(data.discountAmount).toLocaleString("en-IN")}</td>
    </tr>
  ` : "";

  const content = `
    <h2>Order Confirmed! 🎉</h2>
    <p>Hi ${data.customerName},</p>
    <p>Thank you for your order! We've received your order and will begin processing it shortly.</p>

    <div class="info-box">
      <p><strong>Order ID:</strong> ${data.orderId}</p>
      <p><strong>Payment:</strong> <span class="badge ${isCOD ? "badge-cod" : "badge-paid"}">${isCOD ? "Cash on Delivery" : "Paid Online"}</span></p>
      ${data.shippingAddress ? `<p><strong>Shipping to:</strong> ${data.shippingAddress}</p>` : ""}
    </div>

    <table class="order-table">
      <thead>
        <tr>
          <th>Item</th>
          <th style="text-align:center">Qty</th>
          <th style="text-align:right">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        ${discountHtml}
        <tr class="total-row">
          <td colspan="2" style="text-align:right">Total</td>
          <td style="text-align:right">₹${parseFloat(data.totalAmount).toLocaleString("en-IN")}</td>
        </tr>
      </tbody>
    </table>

    <p>We'll notify you once your order has been shipped. Thank you for shopping with Zayelle!</p>
  `;

  try {
    const recipients = [data.customerEmail, FROM_EMAIL];
    await transporter.sendMail({
      from: `"Zayelle" <${FROM_EMAIL}>`,
      to: recipients.join(", "),
      subject: `Order Confirmed - ${data.orderId} | Zayelle`,
      html: baseTemplate(content),
    });
    console.log(`Order confirmation email sent to ${data.customerEmail} and admin for ${data.orderId}`);
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
  }
}

interface ShippingEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  trackingNumber?: string | null;
  trackingCarrier?: string | null;
}

export async function sendShippingNotificationEmail(data: ShippingEmailData) {
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (!smtpUser || !smtpPass) {
    console.log("Email not configured - skipping shipping notification email");
    return;
  }

  const trackingHtml = data.trackingNumber ? `
    <div class="tracking-box">
      <p style="margin:0;font-size:14px;color:#666;">Your Tracking Number</p>
      <p class="tracking-number">${data.trackingNumber}</p>
      ${data.trackingCarrier ? `<p style="margin:0;font-size:14px;color:#666;">Carrier: <strong>${data.trackingCarrier}</strong></p>` : ""}
    </div>
  ` : "";

  const content = `
    <h2>Your Order Has Been Shipped! 📦</h2>
    <p>Hi ${data.customerName},</p>
    <p>Great news! Your order <strong>${data.orderId}</strong> has been shipped and is on its way to you.</p>

    ${trackingHtml}

    <p>You can track your order on our <a href="${process.env.NEXT_PUBLIC_BASE_URL || ""}/pages/track-order" style="color:#000;font-weight:600;">Track Order</a> page using your Order ID.</p>
    <p>Thank you for shopping with Zayelle!</p>
  `;

  try {
    const recipients = [data.customerEmail, FROM_EMAIL];
    await transporter.sendMail({
      from: `"Zayelle" <${FROM_EMAIL}>`,
      to: recipients.join(", "),
      subject: `Your Order ${data.orderId} Has Been Shipped! | Zayelle`,
      html: baseTemplate(content),
    });
    console.log(`Shipping notification email sent to ${data.customerEmail} and admin for ${data.orderId}`);
  } catch (error) {
    console.error("Failed to send shipping notification email:", error);
  }
}
