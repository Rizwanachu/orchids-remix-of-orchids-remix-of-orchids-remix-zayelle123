import { NextRequest, NextResponse } from "next/server";
import { verifyConnection, sendOrderConfirmationEmail } from "@/lib/email";

export async function GET() {
  console.log("Starting email system test...");
  
  // Verify SMTP connection first
  const verification = await verifyConnection();
  if (!verification.success) {
    return NextResponse.json({ 
      error: "SMTP Verification Failed", 
      details: verification.error 
    }, { status: 500 });
  }

  try {
    const testOrder = {
      orderId: "TEST-" + Math.floor(Math.random() * 10000),
      customerName: "Zayelle Tester",
      customerEmail: process.env.SMTP_USER || "test@example.com",
      totalAmount: "2500.00",
      paymentStatus: "paid",
      paymentMethod: "Test",
      items: [
        {
          productName: "Premium Chiffon Hijab",
          quantity: 2,
          price: "1250.00",
          image: "https://www.zayelle.in/logo.png"
        }
      ]
    };

    console.log("Sending test confirmation email...");
    await sendOrderConfirmationEmail(testOrder);
    
    return NextResponse.json({ 
      success: true, 
      message: "Test email process completed. Check server logs for delivery status." 
    });
  } catch (error: any) {
    console.error("Test email route error:", error.message);
    return NextResponse.json({ 
      error: "Route execution failed", 
      details: error.message 
    }, { status: 500 });
  }
}
