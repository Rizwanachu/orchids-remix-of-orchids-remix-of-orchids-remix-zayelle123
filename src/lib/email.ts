import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // Required for some SMTP servers
    rejectUnauthorized: false,
  },
});

const FROM_EMAIL = process.env.SMTP_FROM || process.env.SMTP_USER || "zayelle.in@gmail.com";

export async function verifyConnection() {
  try {
    console.log("Verifying SMTP connection...");
    console.log("SMTP Host:", process.env.SMTP_HOST);
    console.log("SMTP Port:", process.env.SMTP_PORT);
    console.log("SMTP User:", process.env.SMTP_USER ? "Present" : "Missing");
    
    await transporter.verify();
    return { success: true };
  } catch (error: any) {
    console.error("SMTP Connection Verification Failed:", error.message);
    return { success: false, error: error.message };
  }
}

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
    .footer { background: #f5f5f5; padding: 24px; text-align: center; font-size: 12px; color: #999; }
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

export async function sendOrderConfirmationEmail(data: OrderEmailData, retryCount = 0) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.log("Email credentials missing - skipping order confirmation email");
    return;
  }

  try {
    const isCOD = data.paymentMethod?.toLowerCase() === "cod" || data.paymentMethod?.toLowerCase() === "cash on delivery";
    const itemsList = data.items.map(item => `${item.productName} (x${item.quantity})`).join(", ");

    const itemsHtml = data.items.map(item => `
      <tr>
        <td>${item.productName}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">₹${parseFloat(item.price).toLocaleString("en-IN")}</td>
      </tr>
    `).join("");

    const content = `
      <h2>Your Order Confirmation – Thank You for Your Purchase</h2>
      <p>Hello ${data.customerName},</p>
      <p>Thank you for your order!</p>
      <div class="info-box">
        <p><strong>Order ID:</strong> ${data.orderId}</p>
        <p><strong>Items:</strong> ${itemsList}</p>
        <p><strong>Total:</strong> ₹${parseFloat(data.totalAmount).toLocaleString("en-IN")}</p>
      </div>
      <p>Your order has been successfully placed and is now being processed.</p>
      <p>We will notify you once the order status is updated.</p>
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
          <tr class="total-row">
            <td colspan="2" style="text-align:right">Total</td>
            <td style="text-align:right">₹${parseFloat(data.totalAmount).toLocaleString("en-IN")}</td>
          </tr>
        </tbody>
      </table>
      <p>Best regards,<br/>Zayelle Team</p>
    `;

    await transporter.sendMail({
      from: `"Zayelle" <${FROM_EMAIL}>`,
      to: data.customerEmail,
      subject: `Your Order Confirmation – Thank You for Your Purchase`,
      html: baseTemplate(content),
    });
    console.log(`Order confirmation email successfully sent to ${data.customerEmail} for ${data.orderId}`);
  } catch (error: any) {
    console.error(`Failed to send order confirmation email (Attempt ${retryCount + 1}):`, error.message);
    if (retryCount === 0) {
      console.log("Waiting 2 seconds before retrying...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      await sendOrderConfirmationEmail(data, 1);
    }
  }
}

export async function sendShippingNotificationEmail(data: any) {
  // Placeholder to maintain compatibility
  console.log("Shipping notification triggered.");
}
