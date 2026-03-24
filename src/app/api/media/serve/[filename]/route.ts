import { NextRequest, NextResponse } from "next/server";
import { db } from "@/../server/db";
import { media } from "@/../shared/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const result = await db.select().from(media).where(eq(media.filename, filename)).limit(1);

    if (result.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const file = result[0];

    return new NextResponse(file.content as unknown as BodyInit, {
      headers: {
        "Content-Type": file.mimeType,
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
