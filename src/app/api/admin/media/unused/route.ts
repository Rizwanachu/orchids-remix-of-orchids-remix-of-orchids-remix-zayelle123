import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { db } from "@/../server/db";
import { media } from "@/../shared/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const allMedia = await db.select({ filename: media.filename, url: media.url, cloudinaryUrl: media.cloudinaryUrl }).from(media);

    const usedUrlRows = await db.execute(sql`
      SELECT image AS url FROM products WHERE image IS NOT NULL AND image != ''
      UNION ALL
      SELECT hover_image FROM products WHERE hover_image IS NOT NULL AND hover_image != ''
      UNION ALL
      SELECT image_url FROM banners WHERE image_url IS NOT NULL AND image_url != ''
      UNION ALL
      SELECT image_url FROM collections WHERE image_url IS NOT NULL AND image_url != ''
      UNION ALL
      SELECT image_url FROM zayelle_edits WHERE image_url IS NOT NULL AND image_url != ''
      UNION ALL
      SELECT image_url FROM dm_testimonials WHERE image_url IS NOT NULL AND image_url != ''
      UNION ALL
      SELECT image FROM order_items WHERE image IS NOT NULL AND image != ''
    `);

    const galleryRows = await db.execute(sql`
      SELECT gallery FROM products WHERE gallery IS NOT NULL AND gallery != '' AND gallery != 'null'
    `);

    const usedUrls = new Set<string>();
    for (const row of Array.from(usedUrlRows)) {
      const url = (row as any).url;
      if (url) usedUrls.add(url);
    }
    for (const row of Array.from(galleryRows)) {
      try {
        const arr = JSON.parse((row as any).gallery || "[]");
        if (Array.isArray(arr)) arr.forEach((u: string) => usedUrls.add(u));
      } catch {}
    }

    const unusedFilenames = allMedia
      .filter((m) => {
        const effectiveUrl = m.cloudinaryUrl || m.url || "";
        return !usedUrls.has(effectiveUrl);
      })
      .map((m) => m.filename);

    return NextResponse.json({ unused: unusedFilenames });
  } catch (error) {
    console.error("Failed to find unused media:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
