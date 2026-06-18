import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { whatsappLeads } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { desc } from "drizzle-orm";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const leads = await db
      .select()
      .from(whatsappLeads)
      .orderBy(desc(whatsappLeads.createdAt));
    return NextResponse.json({ leads });
  } catch (error) {
    console.error("Error fetching whatsapp leads:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, sourcePage, productName, productHandle, message } = body;

    const [lead] = await db
      .insert(whatsappLeads)
      .values({
        name: name || "",
        phone: phone || "",
        sourcePage: sourcePage || "",
        productName: productName || "",
        productHandle: productHandle || "",
        message: message || "",
        status: "new",
        notes: "",
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("Error creating whatsapp lead:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
