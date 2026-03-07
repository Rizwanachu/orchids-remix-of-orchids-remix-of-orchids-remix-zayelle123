import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_change_me");

export async function GET(request: NextRequest) {
  try {
    const userToken = request.cookies.get("user_token")?.value;
    const adminToken = request.cookies.get("admin_token")?.value;

    if (!userToken && !adminToken) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const token = adminToken || userToken;
    const { payload } = await jwtVerify(token!, JWT_SECRET);

    return NextResponse.json({
      user: {
        id: payload.id,
        email: payload.email as string,
        name: (payload.name as string) || (payload.email as string).split("@")[0],
        isAdmin: payload.role === "admin",
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.set("user_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
