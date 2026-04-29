import nodemailer from "nodemailer";
import { db } from "@/../server/db";
import { orders } from "@/../shared/schema";
import { eq } from "drizzle-orm";
import { getItemConfigLines } from "./order-item-display";
import { optimizeCloudinaryUrl } from "./optimize-cloudinary";

function escHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function itemConfigHtml(item: { colorSelections?: string | null; selectedColor?: string | null; selectedSize?: string | null; bundleType?: string | null }): string {
  const lines = getItemConfigLines(item);
  if (lines.length === 0) return "";
  return lines.map(l => `<div style="font-size:12px;color:#5C4B3D;margin-top:3px;">• ${escHtml(l)}</div>`).join("");
}

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
const LOGO_URL = "https://www.zayelle.in/logo.png";
const SITE_URL = "https://www.zayelle.in";

function toAbsoluteUrl(url: string | null | undefined, width: number = 144): string {
  if (!url) return "https://placehold.co/80x80/f5f2ed/8c6f5a?text=Item";
  const absolute = url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  // Optimize Cloudinary URLs so emails don't pull multi-MB originals.
  return optimizeCloudinaryUrl(absolute, { width });
}

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

function baseTemplate(content: string, previewText: string = ""): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Zayelle</title>
  ${previewText ? `<meta name="description" content="${escHtml(previewText)}">` : ""}
</head>
<body style="margin:0;padding:0;background-color:#f0ebe4;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0ebe4;padding:32px 0 48px;">
    <tr>
      <td align="center">

        <!-- Email card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- Brand accent strip -->
          <tr>
            <td style="background-color:#5C4B3D;height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Logo header -->
          <tr>
            <td align="center" style="background-color:#faf8f5;padding:28px 40px 24px;">
              <img src="${LOGO_URL}" alt="Zayelle" width="130" height="auto" style="display:block;max-width:130px;height:auto;border:0;" onerror="this.style.display='none'">
              <p style="margin:10px 0 0;font-size:11px;color:#8c7b6e;letter-spacing:2px;text-transform:uppercase;">Premium Hijabs &amp; Modest Accessories</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="background-color:#e8e2da;height:1px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding:40px 44px 36px;">
              ${content}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="background-color:#e8e2da;height:1px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color:#faf8f5;padding:24px 40px 28px;">
              <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#5C4B3D;">Zayelle</p>
              <p style="margin:0 0 12px;font-size:12px;color:#8c7b6e;">
                <a href="mailto:zayelle.in@gmail.com" style="color:#5C4B3D;text-decoration:none;">zayelle.in@gmail.com</a>
                &nbsp;·&nbsp;
                <a href="https://www.zayelle.in" style="color:#5C4B3D;text-decoration:none;">www.zayelle.in</a>
              </p>
              <p style="margin:0;font-size:11px;color:#aaa;">&copy; ${new Date().getFullYear()} Zayelle. All rights reserved.</p>
            </td>
          </tr>

          <!-- Bottom accent strip -->
          <tr>
            <td style="background-color:#5C4B3D;height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

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
  totalAmount?: string;
  paymentMethod?: string | null;
  paymentStatus?: string;
  items?: Array<{
    productName: string;
    quantity: number;
    price: string;
    image?: string | null;
    colorSelections?: string | null;
    selectedColor?: string | null;
    selectedSize?: string | null;
    bundleType?: string | null;
  }>;
  couponCode?: string | null;
  discountAmount?: string | null;
  trackingNumber?: string | null;
  trackingCarrier?: string | null;
}

function sectionLabel(text: string): string {
  return `<p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#8c7b6e;">${text}</p>`;
}

function buildItemsHtml(items: OrderEmailData["items"]): string {
  return (items || []).map((item, idx) => `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:${idx === (items || []).length - 1 ? "0" : "12px"};">
      <tr>
        <td width="76" valign="top" style="padding-right:16px;">
          <img src="${toAbsoluteUrl(item.image)}" alt="${escHtml(item.productName)}" width="72" height="72"
            style="display:block;width:72px;height:72px;object-fit:cover;border-radius:8px;background:#f5f2ed;border:1px solid #e8e2da;">
        </td>
        <td valign="top">
          <p style="margin:0 0 3px;font-size:14px;font-weight:600;color:#1a1a1a;line-height:1.4;">${escHtml(item.productName)}</p>
          ${itemConfigHtml(item)}
          <p style="margin:6px 0 0;font-size:13px;color:#757575;">Qty: ${item.quantity}</p>
        </td>
        <td valign="top" align="right" style="padding-left:12px;white-space:nowrap;">
          <p style="margin:0;font-size:14px;font-weight:600;color:#1a1a1a;">₹${parseFloat(item.price).toLocaleString("en-IN")}</p>
        </td>
      </tr>
    </table>
    ${idx < (items || []).length - 1 ? `<div style="height:1px;background:#f0ebe4;margin:0 0 12px;"></div>` : ""}
  `).join("");
}

export async function sendOrderConfirmationEmail(data: OrderEmailData, retryCount = 0) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.error("Email credentials missing - skipping order confirmation email");
    return;
  }

  if (data.id) {
    const [order] = await db.select({ emailSent: orders.emailSent }).from(orders).where(eq(orders.id, data.id));
    if (order?.emailSent) {
      console.log(`Email already sent for order ${data.orderId}, skipping.`);
      return;
    }
  }

  try {
    console.log(`Attempting to send email for Order ${data.orderId} to ${data.customerEmail} (Attempt ${retryCount + 1})`);

    const subtotal = (data.items || []).reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
    const discount = data.discountAmount ? parseFloat(data.discountAmount) : 0;
    const total = parseFloat(data.totalAmount || "0");
    const shipping = 0;

    const paymentStatusLabel = data.paymentStatus
      ? data.paymentStatus.charAt(0).toUpperCase() + data.paymentStatus.slice(1)
      : "Processing";

    const content = `
      <!-- Greeting -->
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.2;">Order Confirmed!</h1>
      <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.6;">
        Hi <strong>${escHtml(data.customerName)}</strong>, thank you for your order. We&apos;re getting it ready for you!
      </p>

      <!-- Order summary box -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#faf8f5;border:1px solid #e8e2da;border-radius:10px;margin-bottom:32px;">
        <tr>
          <td style="padding:20px 24px 8px;">
            ${sectionLabel("Order Summary")}
          </td>
        </tr>
        <tr>
          <td>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:4px 24px 4px;font-size:13px;color:#757575;width:140px;">Order ID</td>
                <td style="padding:4px 24px 4px;font-size:13px;font-weight:600;color:#1a1a1a;">${escHtml(data.orderId)}</td>
              </tr>
              <tr>
                <td style="padding:4px 24px 4px;font-size:13px;color:#757575;">Order Date</td>
                <td style="padding:4px 24px 4px;font-size:13px;font-weight:600;color:#1a1a1a;">${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</td>
              </tr>
              <tr>
                <td style="padding:4px 24px 16px;font-size:13px;color:#757575;">Payment</td>
                <td style="padding:4px 24px 16px;font-size:13px;font-weight:600;color:${data.paymentStatus === "paid" ? "#2e7d32" : "#5C4B3D"};">${escHtml(paymentStatusLabel)}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Items section -->
      <div style="margin-bottom:8px;">${sectionLabel("Items Ordered")}</div>
      <div style="background:#faf8f5;border:1px solid #e8e2da;border-radius:10px;padding:20px 20px 20px;margin-bottom:32px;">
        ${buildItemsHtml(data.items)}
      </div>

      <!-- Order total -->
      <div style="margin-bottom:8px;">${sectionLabel("Order Total")}</div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#faf8f5;border:1px solid #e8e2da;border-radius:10px;margin-bottom:32px;">
        <tr>
          <td style="padding:16px 24px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding-bottom:8px;font-size:13px;color:#757575;">Subtotal</td>
                <td style="padding-bottom:8px;font-size:13px;color:#1a1a1a;text-align:right;">₹${subtotal.toLocaleString("en-IN")}</td>
              </tr>
              ${discount > 0 ? `<tr>
                <td style="padding-bottom:8px;font-size:13px;color:#757575;">Discount${data.couponCode ? ` (${escHtml(data.couponCode)})` : ""}</td>
                <td style="padding-bottom:8px;font-size:13px;color:#2e7d32;text-align:right;">−₹${discount.toLocaleString("en-IN")}</td>
              </tr>` : ""}
              <tr>
                <td style="padding-bottom:12px;font-size:13px;color:#757575;">Shipping</td>
                <td style="padding-bottom:12px;font-size:13px;color:#2e7d32;font-weight:600;text-align:right;">${shipping === 0 ? "FREE" : `₹${shipping.toLocaleString("en-IN")}`}</td>
              </tr>
            </table>
            <div style="height:1px;background:#e8e2da;"></div>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 24px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-size:16px;font-weight:700;color:#1a1a1a;">Total</td>
                <td style="font-size:18px;font-weight:700;color:#5C4B3D;text-align:right;">₹${total.toLocaleString("en-IN")}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- CTA Button -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
        <tr>
          <td align="center">
            <a href="https://www.zayelle.in/account/orders" style="display:inline-block;background-color:#5C4B3D;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;letter-spacing:0.5px;">
              Track Your Order
            </a>
          </td>
        </tr>
      </table>

      <!-- Help section -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0ebe4;border-radius:10px;">
        <tr>
          <td align="center" style="padding:20px 24px;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#1a1a1a;">Need help with your order?</p>
            <p style="margin:0;font-size:13px;color:#757575;">
              Reply to this email or reach us at&nbsp;
              <a href="mailto:zayelle.in@gmail.com" style="color:#5C4B3D;text-decoration:none;font-weight:600;">zayelle.in@gmail.com</a>
            </p>
          </td>
        </tr>
      </table>
    `;

    await transporter.sendMail({
      from: `"Zayelle" <${FROM_EMAIL}>`,
      to: data.customerEmail,
      subject: `Order Confirmed – ${data.orderId} | Zayelle`,
      html: baseTemplate(content, `Your order ${data.orderId} is confirmed! We're preparing it now.`),
    });

    console.log(`Email sent successfully to ${data.customerEmail} for ${data.orderId}`);

    if (data.id) {
      await db.update(orders).set({ emailSent: 1 }).where(eq(orders.id, data.id));
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

    const content = `
      <!-- Greeting -->
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.2;">Your Order is on its Way!</h1>
      <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.6;">
        Great news, <strong>${escHtml(data.customerName)}</strong>! Your Zayelle order has been shipped and is heading your way.
      </p>

      <!-- Tracking box -->
      <div style="margin-bottom:8px;">${sectionLabel("Shipping Details")}</div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#faf8f5;border:1px solid #e8e2da;border-radius:10px;margin-bottom:32px;">
        <tr>
          <td>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:16px 24px 4px;font-size:13px;color:#757575;width:160px;">Order ID</td>
                <td style="padding:16px 24px 4px;font-size:13px;font-weight:600;color:#1a1a1a;">${escHtml(data.orderId)}</td>
              </tr>
              ${data.trackingNumber ? `<tr>
                <td style="padding:4px 24px 4px;font-size:13px;color:#757575;">Tracking Number</td>
                <td style="padding:4px 24px 4px;font-size:13px;font-weight:600;color:#1a1a1a;">${escHtml(data.trackingNumber)}</td>
              </tr>` : ""}
              ${data.trackingCarrier ? `<tr>
                <td style="padding:4px 24px 16px;font-size:13px;color:#757575;">Carrier</td>
                <td style="padding:4px 24px 16px;font-size:13px;font-weight:600;color:#1a1a1a;">${escHtml(data.trackingCarrier)}</td>
              </tr>` : `<tr><td style="padding:4px 24px 16px;" colspan="2"></td></tr>`}
            </table>
          </td>
        </tr>
      </table>

      <!-- Items section -->
      <div style="margin-bottom:8px;">${sectionLabel("Items Shipped")}</div>
      <div style="background:#faf8f5;border:1px solid #e8e2da;border-radius:10px;padding:20px;margin-bottom:32px;">
        ${buildItemsHtml(data.items)}
      </div>

      <!-- CTA Button -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
        <tr>
          <td align="center">
            <a href="https://www.zayelle.in/account/orders" style="display:inline-block;background-color:#5C4B3D;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;letter-spacing:0.5px;">
              Track Your Order
            </a>
          </td>
        </tr>
      </table>

      <!-- Help section -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0ebe4;border-radius:10px;">
        <tr>
          <td align="center" style="padding:20px 24px;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#1a1a1a;">Need help?</p>
            <p style="margin:0;font-size:13px;color:#757575;">
              Contact us at&nbsp;
              <a href="mailto:zayelle.in@gmail.com" style="color:#5C4B3D;text-decoration:none;font-weight:600;">zayelle.in@gmail.com</a>
            </p>
          </td>
        </tr>
      </table>
    `;

    await transporter.sendMail({
      from: `"Zayelle" <${FROM_EMAIL}>`,
      to: data.customerEmail,
      subject: `Your Order ${data.orderId} Has Been Shipped!`,
      html: baseTemplate(content, `Your Zayelle order ${data.orderId} has been shipped!`),
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
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a1a;">New Message Received</h1>
      <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.6;">Someone submitted a message via the Zayelle contact form.</p>

      <div style="margin-bottom:8px;">${sectionLabel("Sender Details")}</div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#faf8f5;border:1px solid #e8e2da;border-radius:10px;margin-bottom:24px;">
        <tr>
          <td>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:16px 24px 4px;font-size:13px;color:#757575;width:100px;">Name</td>
                <td style="padding:16px 24px 4px;font-size:13px;font-weight:600;color:#1a1a1a;">${escHtml(data.name)}</td>
              </tr>
              <tr>
                <td style="padding:4px 24px 4px;font-size:13px;color:#757575;">Email</td>
                <td style="padding:4px 24px 4px;font-size:13px;font-weight:600;color:#1a1a1a;">
                  <a href="mailto:${escHtml(data.email)}" style="color:#5C4B3D;text-decoration:none;">${escHtml(data.email)}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:4px 24px 16px;font-size:13px;color:#757575;">Subject</td>
                <td style="padding:4px 24px 16px;font-size:13px;font-weight:600;color:#1a1a1a;">${escHtml(data.subject)}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <div style="margin-bottom:8px;">${sectionLabel("Message")}</div>
      <div style="background:#faf8f5;border:1px solid #e8e2da;border-radius:10px;padding:20px 24px;margin-bottom:32px;">
        <p style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.7;white-space:pre-wrap;">${escHtml(data.message)}</p>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center">
            <a href="mailto:${escHtml(data.email)}?subject=Re: ${encodeURIComponent(data.subject)}" style="display:inline-block;background-color:#5C4B3D;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;letter-spacing:0.5px;">
              Reply to ${escHtml(data.name)}
            </a>
          </td>
        </tr>
      </table>
    `;

    await transporter.sendMail({
      from: `"Zayelle Contact Form" <${FROM_EMAIL}>`,
      to: "zayelle.in@gmail.com",
      replyTo: data.email,
      subject: `Contact Form: ${data.subject}`,
      html: baseTemplate(content, `New message from ${data.name} via Zayelle contact form`),
    });

    console.log(`Contact form email sent to zayelle.in@gmail.com from ${data.email}`);
  } catch (error: any) {
    console.error("Failed to send contact form email:", error.message);
    throw error;
  }
}

export async function sendNewOrderNotificationEmail(data: OrderEmailData) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.error("Email credentials missing - skipping new order notification email");
    return;
  }

  try {
    const discount = data.discountAmount ? parseFloat(data.discountAmount) : 0;
    const total = parseFloat(data.totalAmount || "0");
    const subtotal = (data.items || []).reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0);

    const paymentStatusLabel = data.paymentStatus
      ? data.paymentStatus.charAt(0).toUpperCase() + data.paymentStatus.slice(1)
      : "Processing";

    const content = `
      <!-- Heading -->
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1a1a;line-height:1.2;">New Order Received</h1>
      <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.6;">
        A new order has been placed on Zayelle.
        <strong style="color:#5C4B3D;">Order ${escHtml(data.orderId)}</strong> — ₹${total.toLocaleString("en-IN")}
      </p>

      <!-- Customer details -->
      <div style="margin-bottom:8px;">${sectionLabel("Customer Details")}</div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#faf8f5;border:1px solid #e8e2da;border-radius:10px;margin-bottom:24px;">
        <tr>
          <td>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:16px 24px 4px;font-size:13px;color:#757575;width:160px;">Name</td>
                <td style="padding:16px 24px 4px;font-size:13px;font-weight:600;color:#1a1a1a;">${escHtml(data.customerName)}</td>
              </tr>
              <tr>
                <td style="padding:4px 24px 4px;font-size:13px;color:#757575;">Email</td>
                <td style="padding:4px 24px 4px;font-size:13px;font-weight:600;color:#1a1a1a;">
                  <a href="mailto:${escHtml(data.customerEmail)}" style="color:#5C4B3D;text-decoration:none;">${escHtml(data.customerEmail)}</a>
                </td>
              </tr>
              ${data.customerPhone ? `<tr>
                <td style="padding:4px 24px 4px;font-size:13px;color:#757575;">Phone</td>
                <td style="padding:4px 24px 4px;font-size:13px;font-weight:600;color:#1a1a1a;">${escHtml(data.customerPhone)}</td>
              </tr>` : ""}
              ${data.shippingAddress ? `<tr>
                <td style="padding:4px 24px 16px;font-size:13px;color:#757575;vertical-align:top;">Ship To</td>
                <td style="padding:4px 24px 16px;font-size:13px;color:#1a1a1a;line-height:1.5;">${escHtml(data.shippingAddress)}</td>
              </tr>` : `<tr><td style="padding:4px 24px 12px;" colspan="2"></td></tr>`}
            </table>
          </td>
        </tr>
      </table>

      <!-- Order details -->
      <div style="margin-bottom:8px;">${sectionLabel("Order Details")}</div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#faf8f5;border:1px solid #e8e2da;border-radius:10px;margin-bottom:24px;">
        <tr>
          <td>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:16px 24px 4px;font-size:13px;color:#757575;width:160px;">Order ID</td>
                <td style="padding:16px 24px 4px;font-size:13px;font-weight:600;color:#1a1a1a;">${escHtml(data.orderId)}</td>
              </tr>
              <tr>
                <td style="padding:4px 24px 4px;font-size:13px;color:#757575;">Date</td>
                <td style="padding:4px 24px 4px;font-size:13px;font-weight:600;color:#1a1a1a;">${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
              </tr>
              <tr>
                <td style="padding:4px 24px 4px;font-size:13px;color:#757575;">Payment Method</td>
                <td style="padding:4px 24px 4px;font-size:13px;font-weight:600;color:#1a1a1a;">${escHtml(data.paymentMethod || "N/A")}</td>
              </tr>
              <tr>
                <td style="padding:4px 24px 4px;font-size:13px;color:#757575;">Payment Status</td>
                <td style="padding:4px 24px 4px;font-size:13px;font-weight:600;color:${data.paymentStatus === "paid" ? "#2e7d32" : "#e65100"};">${escHtml(paymentStatusLabel)}</td>
              </tr>
              ${data.couponCode ? `<tr>
                <td style="padding:4px 24px 16px;font-size:13px;color:#757575;">Coupon Used</td>
                <td style="padding:4px 24px 16px;font-size:13px;font-weight:600;color:#1a1a1a;">${escHtml(data.couponCode)}</td>
              </tr>` : `<tr><td style="padding:4px 24px 12px;" colspan="2"></td></tr>`}
            </table>
          </td>
        </tr>
      </table>

      <!-- Items -->
      <div style="margin-bottom:8px;">${sectionLabel("Items Ordered")}</div>
      <div style="background:#faf8f5;border:1px solid #e8e2da;border-radius:10px;padding:20px;margin-bottom:24px;">
        ${buildItemsHtml(data.items)}
      </div>

      <!-- Totals -->
      <div style="margin-bottom:8px;">${sectionLabel("Order Total")}</div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#faf8f5;border:1px solid #e8e2da;border-radius:10px;margin-bottom:32px;">
        <tr>
          <td style="padding:16px 24px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding-bottom:8px;font-size:13px;color:#757575;">Subtotal</td>
                <td style="padding-bottom:8px;font-size:13px;color:#1a1a1a;text-align:right;">₹${subtotal.toLocaleString("en-IN")}</td>
              </tr>
              ${discount > 0 ? `<tr>
                <td style="padding-bottom:8px;font-size:13px;color:#757575;">Discount${data.couponCode ? ` (${escHtml(data.couponCode)})` : ""}</td>
                <td style="padding-bottom:8px;font-size:13px;color:#2e7d32;text-align:right;">−₹${discount.toLocaleString("en-IN")}</td>
              </tr>` : ""}
            </table>
            <div style="height:1px;background:#e8e2da;margin-bottom:0;"></div>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 24px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-size:16px;font-weight:700;color:#1a1a1a;">Total</td>
                <td style="font-size:18px;font-weight:700;color:#5C4B3D;text-align:right;">₹${total.toLocaleString("en-IN")}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- CTA Button -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center">
            <a href="https://www.zayelle.in/letsgetsuccessin2026/orders" style="display:inline-block;background-color:#5C4B3D;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;letter-spacing:0.5px;">
              View in Admin Panel
            </a>
          </td>
        </tr>
      </table>
    `;

    await transporter.sendMail({
      from: `"Zayelle Store" <${FROM_EMAIL}>`,
      to: "zayelle.in@gmail.com",
      subject: `New Order – ${data.orderId} | ₹${total.toLocaleString("en-IN")}`,
      html: baseTemplate(content, `New order ${data.orderId} received – ₹${total.toLocaleString("en-IN")}`),
    });

    console.log(`New order notification sent to zayelle.in@gmail.com for order ${data.orderId}`);
  } catch (error: any) {
    console.error(`Failed to send new order notification for ${data.orderId}:`, error.message);
  }
}

export async function sendAbandonedCartEmail(customerEmail: string, customerName: string, items: any[], type: "30min" | "12hr" | "24hr") {
  const smtpUser = process.env.SMTP_USER;
  if (!smtpUser) return;

  try {
    const itemsHtml = items.map((item, idx) => `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:${idx === items.length - 1 ? "0" : "12px"};">
        <tr>
          <td width="76" valign="top" style="padding-right:16px;">
            <img src="${toAbsoluteUrl(item.image)}" alt="${escHtml(item.name)}" width="72" height="72"
              style="display:block;width:72px;height:72px;object-fit:cover;border-radius:8px;background:#f5f2ed;border:1px solid #e8e2da;">
          </td>
          <td valign="top">
            <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#1a1a1a;">${escHtml(item.name)}</p>
            <p style="margin:0;font-size:13px;color:#757575;">Qty: ${item.quantity}</p>
          </td>
        </tr>
      </table>
      ${idx < items.length - 1 ? `<div style="height:1px;background:#f0ebe4;margin:0 0 12px;"></div>` : ""}
    `).join("");

    const content = `
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1a1a;">You left something beautiful behind</h1>
      <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.6;">
        Hi <strong>${escHtml(customerName)}</strong>, your cart is waiting for you!
      </p>

      <div style="margin-bottom:8px;">${sectionLabel("Items in Your Cart")}</div>
      <div style="background:#faf8f5;border:1px solid #e8e2da;border-radius:10px;padding:20px;margin-bottom:32px;">
        ${itemsHtml}
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
        <tr>
          <td align="center">
            <a href="https://www.zayelle.in/cart" style="display:inline-block;background-color:#5C4B3D;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;letter-spacing:0.5px;">
              Complete Your Purchase
            </a>
          </td>
        </tr>
      </table>
    `;

    await transporter.sendMail({
      from: `"Zayelle" <${FROM_EMAIL}>`,
      to: customerEmail,
      subject: "You left something beautiful behind ✨",
      html: baseTemplate(content, "Your Zayelle cart is waiting for you!"),
    });

    console.log(`Abandoned cart email (${type}) sent to ${customerEmail}`);
  } catch (error: any) {
    console.error(`Failed to send abandoned cart email:`, error.message);
  }
}
