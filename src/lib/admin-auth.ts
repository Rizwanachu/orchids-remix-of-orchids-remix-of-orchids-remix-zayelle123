import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_change_me");

export async function verifyAdmin(): Promise<{ id: number; email: string; role: string } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== "admin") return null;

    return {
      id: payload.id as number,
      email: payload.email as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}
