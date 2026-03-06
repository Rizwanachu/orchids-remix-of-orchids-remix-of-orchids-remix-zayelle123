import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_change_me");

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /letsgetsuccessin2026 routes, but allow /letsgetsuccessin2026/login
  if (pathname.startsWith("/letsgetsuccessin2026")) {
    if (pathname === "/letsgetsuccessin2026/login") {
      return NextResponse.next();
    }

    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/letsgetsuccessin2026/login", request.url));
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      
      if (payload.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
      
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL("/letsgetsuccessin2026/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/letsgetsuccessin2026/:path*"],
};
