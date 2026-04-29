import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { media } from "@/../shared/schema";
import { eq } from "drizzle-orm";
import { optimizeCloudinaryUrl } from "@/lib/optimize-cloudinary";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // Step 1: fetch only cloudinary_url — no bytea transferred if redirect is possible
    const meta = await db
      .select({ cloudinaryUrl: media.cloudinaryUrl })
      .from(media)
      .where(eq(media.filename, filename))
      .limit(1);

    if (meta.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Fast path: redirect to Cloudinary without touching bytea content at all.
    // Apply f_auto,q_auto,c_limit so external callers (emails, og scrapers,
    // old links) never receive the raw original.
    if (meta[0].cloudinaryUrl) {
      const widthParam = request.nextUrl.searchParams.get("w");
      const width = widthParam ? parseInt(widthParam, 10) : 1600;
      const optimized = optimizeCloudinaryUrl(meta[0].cloudinaryUrl, {
        width: Number.isFinite(width) && width > 0 ? width : 1600,
      });
      return NextResponse.redirect(optimized, { status: 301 });
    }

    // Slow path: only fetch bytea for the rare non-migrated files
    const full = await db
      .select({ content: media.content, mimeType: media.mimeType })
      .from(media)
      .where(eq(media.filename, filename))
      .limit(1);

    if (full.length === 0 || !full[0].content) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return new NextResponse(full[0].content as unknown as BodyInit, {
      headers: {
        "Content-Type": full[0].mimeType,
        "Cache-Control": "public, s-maxage=31536000, max-age=31536000, immutable",
        "CDN-Cache-Control": "public, max-age=31536000, immutable",
        "Vercel-CDN-Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving media:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
