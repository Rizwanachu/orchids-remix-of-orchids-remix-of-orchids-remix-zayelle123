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

async function main() {
  console.log("=== Cloudinary Migration Script ===\n");

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error("ERROR: Missing Cloudinary environment variables.");
    process.exit(1);
  }

  // ── 1. Get counts ────────────────────────────────────────────────────────
  const [{ done_count }] = await client<[{ done_count: number }]>`
    SELECT COUNT(*)::int AS done_count FROM media WHERE cloudinary_url IS NOT NULL
  `;
  const [{ total_count }] = await client<[{ total_count: number }]>`
    SELECT COUNT(*)::int AS total_count FROM media
  `;
  const remaining = total_count - done_count;

  console.log(`Total files  : ${total_count}`);
  console.log(`Already done : ${done_count}`);
  console.log(`To upload    : ${remaining}\n`);

  // ── 2. Load URL map for already-done rows (metadata only, no binary) ────
  const doneMeta = await client<{ filename: string; cloudinary_url: string }[]>`
    SELECT filename, cloudinary_url FROM media WHERE cloudinary_url IS NOT NULL
  `;
  const urlMap: Record<string, string> = {};
  for (const row of doneMeta) {
    urlMap[`/api/media/serve/${row.filename}`] = row.cloudinary_url;
  }

  // ── 3. Get IDs of pending rows (no content yet) ──────────────────────────
  const pendingIds = await client<{ id: number }[]>`
    SELECT id FROM media WHERE cloudinary_url IS NULL ORDER BY id ASC
  `;

  let uploaded = 0;
  let failed = 0;

  // ── 4. Process one row at a time (fetch binary one-by-one to avoid OOM) ──
  for (const { id } of pendingIds) {
    const [row] = await client<{ id: number; filename: string; content: Buffer; mime_type: string }[]>`
      SELECT id, filename, content, mime_type FROM media WHERE id = ${id}
    `;

    if (!row) continue;

    const oldUrl = `/api/media/serve/${row.filename}`;
    const publicId = row.filename.replace(/\.[^.]+$/, "");
    const resourceType = row.mime_type.startsWith("image/") ? "image" : "raw";

    try {
      const result = await uploadStream(row.content, {
        public_id: `zayelle/${publicId}`,
        resource_type: resourceType,
        overwrite: false,
      });

      await client`UPDATE media SET cloudinary_url = ${result.secure_url} WHERE id = ${row.id}`;

      urlMap[oldUrl] = result.secure_url;
      uploaded++;
      console.log(`[${done_count + uploaded}/${total_count}] ${row.filename} → ${result.secure_url}`);
    } catch (err) {
      console.error(`[FAIL] ${row.filename}: ${(err as Error).message}`);
      failed++;
    }
  }

  console.log(`\nUpload phase complete:`);
  console.log(`  Newly uploaded : ${uploaded}`);
  console.log(`  Skipped        : ${done_count}`);
  console.log(`  Failed         : ${failed}`);

  // ── 5. Save URL map backup ───────────────────────────────────────────────
  const backupPath = path.join(process.cwd(), "scripts", "cloudinary-url-map.json");
  fs.writeFileSync(backupPath, JSON.stringify(urlMap, null, 2));
  console.log(`\nURL map saved to: ${backupPath}`);

  // ── 6. Update all tables in a single transaction ─────────────────────────
  console.log("\nUpdating all database tables...");

  await client.begin(async (sql) => {
    // products.image
    const productImages = await sql<{ id: number; image: string }[]>`
      SELECT id, image FROM products WHERE image LIKE '/api/media/serve/%'
    `;
    for (const p of productImages) {
      const newUrl = urlMap[p.image];
      if (newUrl) await sql`UPDATE products SET image = ${newUrl} WHERE id = ${p.id}`;
    }
    console.log(`  ✓ products.image: ${productImages.length} rows checked`);

    // products.hover_image
    const hoverImages = await sql<{ id: number; hover_image: string }[]>`
      SELECT id, hover_image FROM products WHERE hover_image LIKE '/api/media/serve/%'
    `;
    for (const p of hoverImages) {
      const newUrl = urlMap[p.hover_image];
      if (newUrl) await sql`UPDATE products SET hover_image = ${newUrl} WHERE id = ${p.id}`;
    }
    console.log(`  ✓ products.hover_image: ${hoverImages.length} rows checked`);

    // products.gallery (JSON array)
    const galleries = await sql<{ id: number; gallery: string }[]>`
      SELECT id, gallery FROM products WHERE gallery LIKE '%/api/media/serve/%'
    `;
    for (const p of galleries) {
      try {
        const arr: string[] = JSON.parse(p.gallery);
        const updated = arr.map((u) => urlMap[u] ?? u);
        await sql`UPDATE products SET gallery = ${JSON.stringify(updated)} WHERE id = ${p.id}`;
      } catch {
        console.warn(`  WARNING: Could not parse gallery JSON for product ${p.id}`);
      }
    }
    console.log(`  ✓ products.gallery: ${galleries.length} rows checked`);

    // products.colors (nested JSON)
    const colorRows = await sql<{ id: number; colors: string }[]>`
      SELECT id, colors FROM products WHERE colors LIKE '%/api/media/serve/%'
    `;
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
    console.log(`  ✓ products.colors: ${colorRows.length} rows checked`);

    // banners.image_url
    const bannerRows = await sql<{ id: number; image_url: string }[]>`
      SELECT id, image_url FROM banners WHERE image_url LIKE '/api/media/serve/%'
    `;
    for (const b of bannerRows) {
      const newUrl = urlMap[b.image_url];
      if (newUrl) await sql`UPDATE banners SET image_url = ${newUrl} WHERE id = ${b.id}`;
    }
    console.log(`  ✓ banners.image_url: ${bannerRows.length} rows checked`);

    // collections.image_url
    const collectionRows = await sql<{ id: number; image_url: string }[]>`
      SELECT id, image_url FROM collections WHERE image_url LIKE '/api/media/serve/%'
    `;
    for (const c of collectionRows) {
      const newUrl = urlMap[c.image_url];
      if (newUrl) await sql`UPDATE collections SET image_url = ${newUrl} WHERE id = ${c.id}`;
    }
    console.log(`  ✓ collections.image_url: ${collectionRows.length} rows checked`);

    // zayelle_edits.image_url
    const editRows = await sql<{ id: number; image_url: string }[]>`
      SELECT id, image_url FROM zayelle_edits WHERE image_url LIKE '/api/media/serve/%'
    `;
    for (const e of editRows) {
      const newUrl = urlMap[e.image_url];
      if (newUrl) await sql`UPDATE zayelle_edits SET image_url = ${newUrl} WHERE id = ${e.id}`;
    }
    console.log(`  ✓ zayelle_edits.image_url: ${editRows.length} rows checked`);

    // dm_testimonials.image_url
    const testimonialRows = await sql<{ id: number; image_url: string }[]>`
      SELECT id, image_url FROM dm_testimonials WHERE image_url LIKE '/api/media/serve/%'
    `;
    for (const t of testimonialRows) {
      const newUrl = urlMap[t.image_url];
      if (newUrl) await sql`UPDATE dm_testimonials SET image_url = ${newUrl} WHERE id = ${t.id}`;
    }
    console.log(`  ✓ dm_testimonials.image_url: ${testimonialRows.length} rows checked`);

    // order_items.image
    const orderItemRows = await sql<{ id: number; image: string }[]>`
      SELECT id, image FROM order_items WHERE image LIKE '/api/media/serve/%'
    `;
    for (const o of orderItemRows) {
      const newUrl = urlMap[o.image];
      if (newUrl) await sql`UPDATE order_items SET image = ${newUrl} WHERE id = ${o.id}`;
    }
    console.log(`  ✓ order_items.image: ${orderItemRows.length} rows checked`);
  });

  console.log("\n✓ All tables updated successfully.");
  console.log("\n=== Migration Complete ===");
  console.log(`  Newly uploaded to Cloudinary : ${uploaded}`);
  console.log(`  Already migrated (skipped)   : ${done_count}`);
  console.log(`  Failed uploads               : ${failed}`);
  console.log(`  Tables updated               : 9`);
  console.log(`  URL map backup               : ${backupPath}`);

  if (failed > 0) {
    console.log("\nWARNING: Some files failed. Re-run the script to retry — completed files will be skipped.");
  }

  await client.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
