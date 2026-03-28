import "dotenv/config";
import postgres from "postgres";
import { v2 as cloudinary } from "cloudinary";
import * as fs from "fs";
import * as path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const rawUrl = process.env.DATABASE_URL!.replace(/-pooler\./, ".");
const client = postgres(rawUrl, { prepare: false });

function uploadStream(
  buffer: Buffer,
  options: Record<string, unknown>
): Promise<{ secure_url: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("No result from Cloudinary"));
        resolve(result as { secure_url: string });
      }
    );
    stream.end(buffer);
  });
}

function replaceUrls(urlMap: Record<string, string>, value: string): string {
  let result = value;
  for (const [oldUrl, newUrl] of Object.entries(urlMap)) {
    result = result.replaceAll(oldUrl, newUrl);
  }
  return result;
}

async function main() {
  console.log("=== Cloudinary Migration Script ===\n");

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error("ERROR: Missing Cloudinary environment variables.");
    process.exit(1);
  }

  // ── 1. Fetch all media rows ─────────────────────────────────────────────
  console.log("Fetching all media rows from database...");
  const rows = await client<{ id: number; filename: string; content: Buffer; mime_type: string; cloudinary_url: string | null }[]>`
    SELECT id, filename, content, mime_type, cloudinary_url FROM media ORDER BY id ASC
  `;
  console.log(`Found ${rows.length} files to process.\n`);

  // ── 2. Upload each file to Cloudinary ───────────────────────────────────
  const urlMap: Record<string, string> = {};
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows) {
    const oldUrl = `/api/media/serve/${row.filename}`;

    if (row.cloudinary_url) {
      console.log(`[SKIP] ${row.filename} — already on Cloudinary: ${row.cloudinary_url}`);
      urlMap[oldUrl] = row.cloudinary_url;
      skipped++;
      continue;
    }

    const publicId = row.filename.replace(/\.[^.]+$/, "");
    const resourceType = row.mime_type.startsWith("image/") ? "image" : "raw";

    try {
      const result = await uploadStream(row.content, {
        public_id: `zayelle/${publicId}`,
        resource_type: resourceType,
        overwrite: false,
      });

      await client`
        UPDATE media SET cloudinary_url = ${result.secure_url} WHERE id = ${row.id}
      `;

      urlMap[oldUrl] = result.secure_url;
      uploaded++;
      console.log(`[${uploaded + skipped}/${rows.length}] ${row.filename} → ${result.secure_url}`);
    } catch (err) {
      console.error(`[FAIL] ${row.filename}: ${(err as Error).message}`);
      failed++;
    }
  }

  console.log(`\nUpload complete: ${uploaded} uploaded, ${skipped} skipped, ${failed} failed.\n`);

  if (Object.keys(urlMap).length === 0) {
    console.error("No URL mappings built — aborting DB update.");
    await client.end();
    process.exit(1);
  }

  // ── 3. Save URL map backup ──────────────────────────────────────────────
  const backupPath = path.join(process.cwd(), "scripts", "cloudinary-url-map.json");
  fs.writeFileSync(backupPath, JSON.stringify(urlMap, null, 2));
  console.log(`URL map saved to: ${backupPath}\n`);

  // ── 4. Update all tables in a single transaction ────────────────────────
  console.log("Updating all database tables...");

  await client.begin(async (sql) => {
    // products.image (simple text)
    const productImages = await sql<{ id: number; image: string }[]>`SELECT id, image FROM products WHERE image LIKE '/api/media/serve/%'`;
    for (const p of productImages) {
      const newUrl = urlMap[p.image];
      if (newUrl) await sql`UPDATE products SET image = ${newUrl} WHERE id = ${p.id}`;
    }
    console.log(`  products.image: updated ${productImages.length} rows`);

    // products.hover_image (simple text)
    const hoverImages = await sql<{ id: number; hover_image: string }[]>`SELECT id, hover_image FROM products WHERE hover_image LIKE '/api/media/serve/%'`;
    for (const p of hoverImages) {
      const newUrl = urlMap[p.hover_image];
      if (newUrl) await sql`UPDATE products SET hover_image = ${newUrl} WHERE id = ${p.id}`;
    }
    console.log(`  products.hover_image: updated ${hoverImages.length} rows`);

    // products.gallery (JSON array of URL strings)
    const galleries = await sql<{ id: number; gallery: string }[]>`SELECT id, gallery FROM products WHERE gallery LIKE '%/api/media/serve/%'`;
    for (const p of galleries) {
      try {
        const arr: string[] = JSON.parse(p.gallery);
        const updated = arr.map((u) => urlMap[u] ?? u);
        await sql`UPDATE products SET gallery = ${JSON.stringify(updated)} WHERE id = ${p.id}`;
      } catch {
        console.warn(`  WARNING: Could not parse gallery JSON for product ${p.id}`);
      }
    }
    console.log(`  products.gallery: updated ${galleries.length} rows`);

    // products.colors (nested JSON — each color has images[])
    const colorRows = await sql<{ id: number; colors: string }[]>`SELECT id, colors FROM products WHERE colors LIKE '%/api/media/serve/%'`;
    for (const p of colorRows) {
      try {
        const colors: Array<{ name: string; hex: string; images?: string[]; outOfStock?: boolean }> = JSON.parse(p.colors);
        const updated = colors.map((c) => ({
          ...c,
          images: (c.images ?? []).map((u) => urlMap[u] ?? u),
        }));
        await sql`UPDATE products SET colors = ${JSON.stringify(updated)} WHERE id = ${p.id}`;
      } catch {
        console.warn(`  WARNING: Could not parse colors JSON for product ${p.id}`);
      }
    }
    console.log(`  products.colors: updated ${colorRows.length} rows`);

    // banners.image_url (simple text)
    const bannerRows = await sql<{ id: number; image_url: string }[]>`SELECT id, image_url FROM banners WHERE image_url LIKE '/api/media/serve/%'`;
    for (const b of bannerRows) {
      const newUrl = urlMap[b.image_url];
      if (newUrl) await sql`UPDATE banners SET image_url = ${newUrl} WHERE id = ${b.id}`;
    }
    console.log(`  banners.image_url: updated ${bannerRows.length} rows`);

    // collections.image_url (simple text)
    const collectionRows = await sql<{ id: number; image_url: string }[]>`SELECT id, image_url FROM collections WHERE image_url LIKE '/api/media/serve/%'`;
    for (const c of collectionRows) {
      const newUrl = urlMap[c.image_url];
      if (newUrl) await sql`UPDATE collections SET image_url = ${newUrl} WHERE id = ${c.id}`;
    }
    console.log(`  collections.image_url: updated ${collectionRows.length} rows`);

    // zayelle_edits.image_url (simple text)
    const editRows = await sql<{ id: number; image_url: string }[]>`SELECT id, image_url FROM zayelle_edits WHERE image_url LIKE '/api/media/serve/%'`;
    for (const e of editRows) {
      const newUrl = urlMap[e.image_url];
      if (newUrl) await sql`UPDATE zayelle_edits SET image_url = ${newUrl} WHERE id = ${e.id}`;
    }
    console.log(`  zayelle_edits.image_url: updated ${editRows.length} rows`);

    // dm_testimonials.image_url (simple text)
    const testimonialRows = await sql<{ id: number; image_url: string }[]>`SELECT id, image_url FROM dm_testimonials WHERE image_url LIKE '/api/media/serve/%'`;
    for (const t of testimonialRows) {
      const newUrl = urlMap[t.image_url];
      if (newUrl) await sql`UPDATE dm_testimonials SET image_url = ${newUrl} WHERE id = ${t.id}`;
    }
    console.log(`  dm_testimonials.image_url: updated ${testimonialRows.length} rows`);

    // order_items.image (simple text)
    const orderItemRows = await sql<{ id: number; image: string }[]>`SELECT id, image FROM order_items WHERE image LIKE '/api/media/serve/%'`;
    for (const o of orderItemRows) {
      const newUrl = urlMap[o.image];
      if (newUrl) await sql`UPDATE order_items SET image = ${newUrl} WHERE id = ${o.id}`;
    }
    console.log(`  order_items.image: updated ${orderItemRows.length} rows`);
  });

  console.log("\n✓ All tables updated successfully.");
  console.log("\n=== Migration Complete ===");
  console.log(`Total uploaded: ${uploaded}`);
  console.log(`Total skipped (already migrated): ${skipped}`);
  console.log(`Total failed: ${failed}`);
  if (failed > 0) {
    console.log("\nWARNING: Some files failed to upload. Re-run the script to retry — already-uploaded files will be skipped.");
  }

  await client.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
