import { NextRequest, NextResponse } from "next/server";
import { verifyConnection, sendOrderConfirmationEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const result = await verifyConnection();
  
  if (!result.success) {
    return NextResponse.json({ error: "SMTP Connection Failed", message: result.error }, { status: 500 });
  }

  const sampleData = {
    orderId: "ZAY-TEST-101",
    customerName: "Test User",
    customerEmail: "zayelle.in@gmail.com", // Send to brand email for testing
    totalAmount: "1499",
    paymentStatus: "paid",
    paymentMethod: "Razorpay",
    items: [
      {
        productName: "Premium Chiffon Hijab - Beige",
        quantity: 1,
        price: "1499",
        image: "https://slelguoygbfzlbylpxfs.supabase.co/storage/v1/object/public/test-clones/375dbfa2-908b-470f-858e-bf9b21b99d2e-thebeige-in/assets/images/DCE08277-C327-425E-90D0-AE38F478E185-30.jpg"
      }
    ]
  };

  await sendOrderConfirmationEmail(sampleData);

  return NextResponse.json({ success: true, message: "Sample email sent successfully" });
}
