import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { reviews, products } from "@/../shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const approvedReviews = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.productId, parseInt(productId)), eq(reviews.status, "approved")))
      .orderBy(desc(reviews.createdAt));

    const stats = await db
      .select({
        count: sql<number>`count(*)::int`,
        avg: sql<number>`coalesce(round(avg(${reviews.rating})::numeric, 1), 0)::float`,
      })
      .from(reviews)
      .where(and(eq(reviews.productId, parseInt(productId)), eq(reviews.status, "approved")));

    return NextResponse.json({
      reviews: approvedReviews,
      totalReviews: stats[0]?.count || 0,
      averageRating: stats[0]?.avg || 0,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, customerName, customerEmail, rating, comment, imageUrl } = body;

    if (!productId || !customerName || !customerEmail || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const [product] = await db.select().from(products).where(eq(products.id, parseInt(productId)));
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const [review] = await db
      .insert(reviews)
      .values({
        productId: parseInt(productId),
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        rating: parseInt(rating),
        comment: (comment || "").trim(),
        imageUrl: imageUrl || null,
        status: "pending",
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Thank you for your review! It will be published once approved.",
      review,
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
