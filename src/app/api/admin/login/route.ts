import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { users } from "@/../shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { logAdminActivity } from "@/lib/activity-logger";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_change_me";

const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function getClientIP(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
}

function isRateLimited(ip: string): boolean {
  const entry = loginAttempts.get(ip);
  if (!entry) return false;

  if (Date.now() - entry.firstAttempt > RATE_LIMIT_WINDOW) {
    loginAttempts.delete(ip);
    return false;
  }

  return entry.count >= MAX_ATTEMPTS;
}

function recordAttempt(ip: string) {
  const entry = loginAttempts.get(ip);
  if (!entry || Date.now() - entry.firstAttempt > RATE_LIMIT_WINDOW) {
    loginAttempts.set(ip, { count: 1, firstAttempt: Date.now() });
  } else {
    entry.count++;
  }
}

function clearAttempts(ip: string) {
  loginAttempts.delete(ip);
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user || user.role !== "admin") {
      recordAttempt(ip);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      recordAttempt(ip);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    clearAttempts(ip);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    await logAdminActivity(user.id, user.email, "admin_login", `Admin logged in from IP: ${ip}`);

    const response = NextResponse.json({ success: true });
    
    // Set cookie with appropriate flags for the environment
    const isProduction = process.env.NODE_ENV === "production";
    
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
