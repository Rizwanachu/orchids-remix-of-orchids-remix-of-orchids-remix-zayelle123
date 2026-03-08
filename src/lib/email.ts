import nodemailer from "nodemailer";
import { db } from "@/../server/db";
import { orders } from "@/../shared/schema";
import { eq } from "drizzle-orm";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const FROM_EMAIL = process.env.SMTP_FROM || process.env.SMTP_USER || "zayelle.in@gmail.com";
const LOGO_URL = "https://www.zayelle.in/_next/image?url=%2Flogo.png%3Fv%3D1772539365565&w=384&q=75";

export async function verifyConnection() {
  try {
    console.log("Verifying SMTP connection...");
    await transporter.verify();
    console.log("SMTP Connection Verified successfully");
    return { success: true };
  } catch (error: any) {
    console.error("SMTP Connection Verification Failed:", error.message);
    return { success: false, error: error.message };
  }
}

function baseTemplate(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background-color: #f6f1eb; font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: #f6f1eb; padding: 20px; text-align: center; }
    .header img { height: 40px; width: auto; display: block; margin: 0 auto; }
    .content { padding: 40px 30px; color: #1a1a1a; line-height: 1.6; }
    .title { font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center; color: #1a1a1a; }
    .message { font-size: 16px; margin-bottom: 30px; color: #1a1a1a; }
    .order-box { background: #f6f1eb; border: 1px solid #e5e0da; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
    .order-box p { margin: 5px 0; font-size: 14px; color: #1a1a1a; }
    .product-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .product-row td { padding: 15px 0; border-bottom: 1px solid #eee; vertical-align: top; }
    .product-image { width: 80px; height: auto; border-radius: 8px; object-fit: cover; background: #f5f5f5; }
    .product-info { padding-left: 20px; padding-right: 20px; }
    .product-name { font-weight: 600; font-size: 16px; color: #1a1a1a; margin-bottom: 5px; }
    .product-meta { font-size: 14px; color: #1a1a1a; margin-bottom: 4px; }
    .product-price { font-weight: 600; color: #1a1a1a; margin-top: 8px; }
    .total-section { border-top: 2px solid #1a1a1a; padding-top: 20px; }
    .total-row { display: table; width: 100%; margin-bottom: 10px; font-size: 14px; color: #1a1a1a; }
    .total-label { display: table-cell; text-align: left; }
    .total-value { display: table-cell; text-align: right; font-weight: 600; }
    .total-row.grand-total { font-weight: bold; font-size: 18px; margin-top: 10px; border-top: 1px solid #eee; padding-top: 10px; color: #1a1a1a; }
    .cta-container { text-align: center; margin-top: 40px; }
    .btn { background: #8c6f5a; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; }
    .footer { padding: 30px; text-align: center; font-size: 12px; color: #1a1a1a; background: #ffffff; margin-top: 30px; }
    
    /* Support for Dark Mode and System Mode */
    @media (prefers-color-scheme: dark) {
      body { background-color: #f6f1eb !important; color: #1a1a1a !important; }
      .container { background-color: #ffffff !important; }
      .header { background-color: #f6f1eb !important; }
      .content { color: #1a1a1a !important; }
      .title { color: #1a1a1a !important; }
      .message { color: #1a1a1a !important; }
      .order-box { background-color: #f6f1eb !important; border-color: #e5e0da !important; }
      .order-box p { color: #1a1a1a !important; }
      .product-row td { border-bottom-color: #eee !important; }
      .product-name { color: #1a1a1a !important; }
      .product-meta { color: #1a1a1a !important; }
      .product-price { color: #1a1a1a !important; }
      .total-section { border-top-color: #1a1a1a !important; }
      .total-row { color: #1a1a1a !important; }
      .total-row.grand-total { border-top-color: #eee !important; color: #1a1a1a !important; }
      .footer { background-color: #ffffff !important; color: #1a1a1a !important; }
    }
    @media only screen and (max-width: 480px) {
      .btn { display: block; width: 100%; box-sizing: border-box; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${LOGO_URL}" alt="Zayelle">
    </div>
    <div class="content">
      <div class="title">${title}</div>
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
  id?: number;
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
    console.error("Email credentials missing - skipping order confirmation email");
    return;
  }

  // Double check if email was already sent for this order in DB
  if (data.id) {
    const [order] = await db.select({ emailSent: orders.emailSent }).from(orders).where(eq(orders.id, data.id));
    if (order?.emailSent) {
      console.log(`Email already sent for order ${data.orderId}, skipping.`);
      return;
    }
  }

  try {
    console.log(`Attempting to send email for Order ${data.orderId} to ${data.customerEmail} (Attempt ${retryCount + 1})`);
    
    const itemsHtml = data.items.map(item => `
      <tr class="product-row">
        <td style="width: 80px; padding-right: 20px; vertical-align: top;">
          <img src="${item.image || 'https://via.placeholder.com/120x150?text=Product'}" class="product-image" alt="${item.productName}">
        </td>
        <td class="product-info" style="padding-left: 0; padding-right: 20px; vertical-align: top;">
          <div class="product-name">${item.productName}</div>
          <div class="product-meta">Quantity: ${item.quantity}</div>
          <div class="product-price">₹${parseFloat(item.price).toLocaleString("en-IN")}</div>
        </td>
      </tr>
    `).join("");

    const subtotal = data.items.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
    const shipping = 0; 
    const discount = data.discountAmount ? parseFloat(data.discountAmount) : 0;

    const content = `
      <p class="message">Hello ${data.customerName},<br><br>Thank you for your order! We are preparing it now.</p>
      
      <div class="order-box">
        <p><strong>Order ID:</strong> ${data.orderId}</p>
        <p><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p><strong>Payment Status:</strong> ${data.paymentStatus ? data.paymentStatus.charAt(0).toUpperCase() + data.paymentStatus.slice(1) : 'Processing'}</p>
      </div>

      <table class="product-table">
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-row">
          <span class="total-label">Subtotal:</span>
          <span class="total-value">₹${subtotal.toLocaleString("en-IN")}</span>
        </div>
        ${discount > 0 ? `
        <div class="total-row">
          <span class="total-label">Discount:</span>
          <span class="total-value">-₹${discount.toLocaleString("en-IN")}</span>
        </div>` : ''}
        <div class="total-row">
          <span class="total-label">Shipping:</span>
          <span class="total-value">${shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString("en-IN")}`}</span>
        </div>
        <div class="total-row grand-total">
          <span class="total-label">Total:</span>
          <span class="total-value">₹${parseFloat(data.totalAmount).toLocaleString("en-IN")}</span>
        </div>
      </div>

      <div class="cta-container">
        <a href="https://www.zayelle.in/account/orders" class="btn">Track Your Order</a>
      </div>

      <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e0da; text-align: center; color: #757575; font-size: 14px;">
        <p style="margin-bottom: 10px; font-weight: 600; color: #1a1a1a;">Need help with your order?</p>
        <p style="margin: 5px 0;"><a href="mailto:zayelle.in@gmail.com" style="color: #8c6f5a; text-decoration: none;">zayelle.in@gmail.com</a></p>
        <p style="margin: 5px 0;"><a href="https://www.zayelle.in" style="color: #8c6f5a; text-decoration: none;">www.zayelle.in</a></p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Zayelle" <${FROM_EMAIL}>`,
      to: data.customerEmail,
      subject: `Your Order Confirmation – Thank You for Your Purchase`,
      html: baseTemplate(content, "Your Order Confirmation"),
    });
    
    console.log(`Email sent successfully to ${data.customerEmail} for ${data.orderId}`);

    // Update DB flag
    if (data.id) {
      await db.update(orders).set({ emailSent: true }).where(eq(orders.id, data.id));
      console.log(`Database updated: emailSent = true for order ${data.orderId}`);
    }
  } catch (error: any) {
    console.error(`Email send failed for ${data.orderId} (Attempt ${retryCount + 1}):`, error.message);
    if (retryCount < 2) {
      console.log("Retrying in 2 seconds...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      return sendOrderConfirmationEmail(data, retryCount + 1);
    }
    console.error(`Max retries reached for ${data.orderId}. Email not sent.`);
  }
}

export async function sendShippingNotificationEmail(data: OrderEmailData, retryCount = 0) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.error("Email credentials missing - skipping shipping notification email");
    return;
  }

  try {
    console.log(`Attempting to send shipping notification for Order ${data.orderId} to ${data.customerEmail}`);
    
    const itemsHtml = data.items.map(item => `
      <tr class="product-row">
        <td style="width: 80px; padding-right: 20px; vertical-align: top;">
          <img src="${item.image || 'https://via.placeholder.com/120x150?text=Product'}" class="product-image" alt="${item.productName}">
        </td>
        <td class="product-info" style="padding-left: 0; padding-right: 20px; vertical-align: top;">
          <div class="product-name">${item.productName}</div>
          <div class="product-meta">Quantity: ${item.quantity}</div>
        </td>
      </tr>
    `).join("");

    const content = `
      <p class="message">Great news, ${data.customerName}! Your order is on its way.</p>
      
      <div class="order-box">
        <p><strong>Order ID:</strong> ${data.orderId}</p>
        ${data.trackingNumber ? `<p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>` : ''}
        ${data.trackingCarrier ? `<p><strong>Carrier:</strong> ${data.trackingCarrier}</p>` : ''}
      </div>

      <table class="product-table">
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="cta-container">
        <a href="https://www.zayelle.in/account/orders" class="btn">Track Your Order</a>
      </div>
    `;

    await transporter.sendMail({
      from: `"Zayelle" <${FROM_EMAIL}>`,
      to: data.customerEmail,
      subject: `Your Order ${data.orderId} Has Been Shipped!`,
      html: baseTemplate(content, "Your Order is on its Way"),
    });
    
    console.log(`Shipping notification sent successfully to ${data.customerEmail}`);
  } catch (error: any) {
    console.error(`Shipping notification failed:`, error.message);
  }
}

export async function sendContactFormEmail(data: { name: string; email: string; subject: string; message: string }) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.error("Email credentials missing - skipping contact form email");
    return;
  }

  try {
    const content = `
      <p class="message">You have received a new message from the contact form on your website.</p>
      
      <div class="order-box">
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> <a href="mailto:${data.email}" style="color: #8c6f5a;">${data.email}</a></p>
        <p><strong>Subject:</strong> ${data.subject}</p>
      </div>

      <div style="background: #fafaf8; border: 1px solid #e5e0da; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <p style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #757575; margin-top: 0; margin-bottom: 10px;">Message</p>
        <p style="font-size: 15px; color: #1a1a1a; line-height: 1.7; white-space: pre-wrap; margin: 0;">${data.message}</p>
      </div>

      <div class="cta-container">
        <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject)}" class="btn">Reply to ${data.name}</a>
      </div>
    `;

    await transporter.sendMail({
      from: `"Zayelle Contact Form" <${FROM_EMAIL}>`,
      to: "zayelle.in@gmail.com",
      replyTo: data.email,
      subject: `Contact Form: ${data.subject}`,
      html: baseTemplate(content, "New Contact Message"),
    });

    console.log(`Contact form email sent to zayelle.in@gmail.com from ${data.email}`);
  } catch (error: any) {
    console.error("Failed to send contact form email:", error.message);
    throw error;
  }
}

export async function sendAbandonedCartEmail(customerEmail: string, customerName: string, items: any[], type: '30min' | '12hr' | '24hr') {
  const smtpUser = process.env.SMTP_USER;
  if (!smtpUser) return;

  try {
    const itemsHtml = items.map(item => `
      <tr class="product-row">
        <td style="width: 100px;">
          <img src="${item.image || 'https://via.placeholder.com/120x150?text=Product'}" class="product-image" alt="${item.name}">
        </td>
        <td class="product-info">
          <div class="product-name">${item.name}</div>
          <div class="product-meta">Quantity: ${item.quantity}</div>
        </td>
      </tr>
    `).join("");

    const content = `
      <p class="message">We noticed you left a few beautiful pieces behind.</p>
      
      <table class="product-table">
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="cta-container">
        <a href="https://www.zayelle.in/cart" class="btn">Continue Checkout</a><br>
        <a href="https://www.zayelle.in/" class="btn btn-secondary">Visit our store</a>
      </div>
    `;

    await transporter.sendMail({
      from: `"Zayelle" <${FROM_EMAIL}>`,
      to: customerEmail,
      subject: "You left something beautiful behind ✨",
      html: baseTemplate(content, "Your cart is ready for checkout"),
    });
    
    console.log(`Abandoned cart email (${type}) sent to ${customerEmail}`);
  } catch (error: any) {
    console.error(`Failed to send abandoned cart email:`, error.message);
  }
}
