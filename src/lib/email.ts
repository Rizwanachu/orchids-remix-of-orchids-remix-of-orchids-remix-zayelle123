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
    rejectUnauthorized: false,
  },
});

const FROM_EMAIL = process.env.SMTP_FROM || process.env.SMTP_USER || "zayelle.in@gmail.com";
const LOGO_URL = "https://www.zayelle.in/_next/image?url=%2Flogo.png%3Fv%3D1772539365565&w=384&q=75";

export async function verifyConnection() {
  try {
    console.log("Verifying SMTP connection...");
    await transporter.verify();
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
    body { margin: 0; padding: 0; background-color: #f4f1ea; font-family: 'Helvetica Neue', Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: #000000; padding: 30px; text-align: center; }
    .header img { height: 40px; width: auto; }
    .content { padding: 40px 30px; color: #333333; line-height: 1.6; }
    .title { font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center; color: #1a1a1a; }
    .message { font-size: 16px; margin-bottom: 30px; color: #4a4a4a; }
    .order-box { background: #fdfcf9; border: 1px solid #e8e2d5; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
    .order-box p { margin: 5px 0; font-size: 14px; color: #666; }
    .product-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .product-row td { padding: 15px 0; border-bottom: 1px solid #eee; vertical-align: top; }
    .product-image { width: 100px; height: 120px; border-radius: 8px; object-fit: cover; background: #f5f5f5; }
    .product-info { padding-left: 20px; }
    .product-name { font-weight: 600; font-size: 16px; color: #1a1a1a; margin-bottom: 5px; }
    .product-meta { font-size: 14px; color: #666; }
    .product-price { font-weight: 600; color: #1a1a1a; margin-top: 5px; }
    .total-section { border-top: 2px solid #1a1a1a; padding-top: 20px; }
    .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
    .total-row.grand-total { font-weight: bold; font-size: 18px; margin-top: 10px; border-top: 1px solid #eee; padding-top: 10px; }
    .cta-container { text-align: center; margin-top: 40px; }
    .btn { background: #7c6e62; color: #ffffff !important; padding: 15px 40px; text-decoration: none; border-radius: 4px; font-weight: 600; display: inline-block; }
    .btn-secondary { background: transparent; color: #7c6e62 !important; border: 1px solid #7c6e62; margin-top: 10px; }
    .footer { padding: 30px; text-align: center; font-size: 12px; color: #999; background: #fdfcf9; }
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
    console.log(`Sending confirmation email for Order ${data.orderId} to ${data.customerEmail}`);
    
    const itemsHtml = data.items.map(item => `
      <tr class="product-row">
        <td style="width: 100px;">
          <img src="${item.image || 'https://via.placeholder.com/120x150?text=Product'}" class="product-image" alt="${item.productName}">
        </td>
        <td class="product-info">
          <div class="product-name">${item.productName}</div>
          <div class="product-meta">Quantity: ${item.quantity}</div>
          <div class="product-price">₹${parseFloat(item.price).toLocaleString("en-IN")}</div>
        </td>
      </tr>
    `).join("");

    const subtotal = data.items.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
    const shipping = 0; // Assuming free shipping for now or can be added to data
    const discount = data.discountAmount ? parseFloat(data.discountAmount) : 0;

    const content = `
      <p class="message">Hello ${data.customerName},<br><br>Thank you for your order! We are preparing it now.</p>
      
      <div class="order-box">
        <p><strong>Order ID:</strong> ${data.orderId}</p>
        <p><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p><strong>Payment Status:</strong> ${data.paymentStatus?.toUpperCase()}</p>
      </div>

      <table class="product-table">
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-row">
          <span>Subtotal</span>
          <span>₹${subtotal.toLocaleString("en-IN")}</span>
        </div>
        ${discount > 0 ? `
        <div class="total-row">
          <span>Discount</span>
          <span>-₹${discount.toLocaleString("en-IN")}</span>
        </div>` : ''}
        <div class="total-row">
          <span>Shipping</span>
          <span>${shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString("en-IN")}`}</span>
        </div>
        <div class="total-row grand-total">
          <span>Total</span>
          <span>₹${parseFloat(data.totalAmount).toLocaleString("en-IN")}</span>
        </div>
      </div>

      <div class="cta-container">
        <a href="https://www.zayelle.in/account/orders" class="btn">Track Your Order</a>
      </div>
    `;

    await transporter.sendMail({
      from: `"Zayelle" <${FROM_EMAIL}>`,
      to: data.customerEmail,
      subject: `Your Order Confirmation – Thank You for Your Purchase`,
      html: baseTemplate(content, "Your Order Confirmation"),
    });
    
    console.log(`Email sent successfully to ${data.customerEmail} for ${data.orderId}`);
  } catch (error: any) {
    console.error(`Failed to send order confirmation email (Attempt ${retryCount + 1}):`, error.message);
    if (retryCount === 0) {
      console.log("Retrying in 2 seconds...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      await sendOrderConfirmationEmail(data, 1);
    }
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
