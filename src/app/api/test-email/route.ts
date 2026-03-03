import { NextRequest, NextResponse } from "next/server";
import { verifyConnection } from "@/lib/email";

export async function GET(request: NextRequest) {
  const result = await verifyConnection();
  if (result.success) {
    return NextResponse.json({ message: "SMTP Connection Successful" });
  } else {
    return NextResponse.json({ error: "SMTP Connection Failed", details: result.error }, { status: 500 });
  }
}
