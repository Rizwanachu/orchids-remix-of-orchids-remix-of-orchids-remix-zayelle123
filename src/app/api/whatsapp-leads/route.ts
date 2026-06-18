import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { whatsappLeads } from "@/../shared/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourcePage, productName, productHandle, message } = body;

    await db.insert(whatsappLeads).values({
      name: "",
      phone: "",
      sourcePage: sourcePage || "",
      productName: productName || "",
      productHandle: productHandle || "",
      message: message || "",
      status: "new",
      notes: "",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false });
  }
}
