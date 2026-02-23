import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { reviews, products } from "@/../shared/schema";
import { verifyAdmin } from "@/lib/admin-auth";
import { eq, desc, sql, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let conditions = [];
    if (status && status !== "all") {
      conditions.push(eq(reviews.status, status as "pending" | "approved" | "rejected"));
    }

    const allReviews = await db
      .select({
        review: reviews,
        productName: products.name,
        productHandle: products.handle,
        productImage: products.image,
      })
      .from(reviews)
      .leftJoin(products, eq(reviews.productId, products.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(reviews.createdAt));

    const counts = await db
      .select({
        status: reviews.status,
        count: sql<number>`count(*)::int`,
      })
      .from(reviews)
      .groupBy(reviews.status);

    const statusCounts = { pending: 0, approved: 0, rejected: 0 };
    counts.forEach((c) => {
      statusCounts[c.status as keyof typeof statusCounts] = c.count;
    });

    return NextResponse.json({
      reviews: allReviews.map((r) => ({
        ...r.review,
        productName: r.productName,
        productHandle: r.productHandle,
        productImage: r.productImage,
      })),
      counts: statusCounts,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
