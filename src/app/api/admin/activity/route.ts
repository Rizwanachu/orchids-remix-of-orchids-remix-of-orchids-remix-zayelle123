import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { adminActivityLogs } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(adminActivityLogs);

    const logs = await db
      .select()
      .from(adminActivityLogs)
      .orderBy(desc(adminActivityLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      logs,
      total: countResult?.count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
