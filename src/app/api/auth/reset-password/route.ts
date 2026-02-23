import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { users } from "@/../shared/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, phone, newPassword } = await request.json();

    if (!email || !phone || !newPassword) {
      return NextResponse.json(
        { error: "Email, phone number, and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address" },
        { status: 404 }
      );
    }

    const normalizedInputPhone = phone.replace(/[\s\-\(\)]/g, "");
    const normalizedStoredPhone = (user.phone || "").replace(/[\s\-\(\)]/g, "");

    if (!normalizedStoredPhone || normalizedInputPhone !== normalizedStoredPhone) {
      return NextResponse.json(
        { error: "Phone number does not match our records" },
        { status: 401 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true, message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
