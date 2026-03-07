import postgres from "postgres";
import crypto from "crypto";

const client = postgres(process.env.DATABASE_URL!);

function detectMimeType(base64: string): string {
  if (base64.startsWith("data:")) {
    const match = base64.match(/^data:(image\/[a-z+]+);base64,/);
    if (match) return match[1];
  }
  const raw = base64.replace(/^data:image\/[a-z+]+;base64,/, "");
  const buf = Buffer.from(raw.substring(0, 16), "base64");
  if (buf[0] === 0xff && buf[1] === 0xd8) return "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50) return "image/png";
  if (buf[0] === 0x52 && buf[1] === 0x49) return "image/webp";
  if (buf[0] === 0x47 && buf[1] === 0x49) return "image/gif";
  return "image/jpeg";
}

function getExtension(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpeg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
  };
  return map[mime] || "jpeg";
}

function isBase64Image(value: string | null): boolean {
  if (!value) return false;
  return value.startsWith("data:image/") || (value.length > 1000 && !value.startsWith("/") && !value.startsWith("http"));
}

async function migrateImages() {
  console.log("Starting base64 image migration...");

  const products = await client`SELECT id, name, image, hover_image FROM products`;
  console.log(`Found ${products.length} products to check`);

  let migratedCount = 0;

  for (const product of products) {
    const updates: Record<string, string> = {};

    if (isBase64Image(product.image)) {
      console.log(`  Product "${product.name}" (id=${product.id}): migrating main image (${(product.image as string).length} chars)...`);
      const url = await uploadBase64ToMedia(product.image as string);
      if (url) {
        updates.image = url;
        migratedCount++;
      }
    }

    if (isBase64Image(product.hover_image)) {
      console.log(`  Product "${product.name}" (id=${product.id}): migrating hover image (${(product.hover_image as string).length} chars)...`);
      const url = await uploadBase64ToMedia(product.hover_image as string);
      if (url) {
        updates.hover_image = url;
        migratedCount++;
      }
    }

    if (Object.keys(updates).length > 0) {
      if (updates.image && updates.hover_image) {
        await client`UPDATE products SET image = ${updates.image}, hover_image = ${updates.hover_image} WHERE id = ${product.id}`;
      } else if (updates.image) {
        await client`UPDATE products SET image = ${updates.image} WHERE id = ${product.id}`;
      } else if (updates.hover_image) {
        await client`UPDATE products SET hover_image = ${updates.hover_image} WHERE id = ${product.id}`;
      }
      console.log(`  Updated product "${product.name}" with new URLs`);
    } else {
      console.log(`  Product "${product.name}" (id=${product.id}): already using URLs, skipping`);
    }
  }

  console.log(`\nMigration complete! Migrated ${migratedCount} images.`);
  await client.end();
}

async function uploadBase64ToMedia(base64Data: string): Promise<string | null> {
  try {
    const mimeType = detectMimeType(base64Data);
    const ext = getExtension(mimeType);
    const raw = base64Data.replace(/^data:image\/[a-z+]+;base64,/, "");
    const buffer = Buffer.from(raw, "base64");
    const filename = `${crypto.randomBytes(16).toString("hex")}.${ext}`;
    const url = `/api/media/serve/${filename}`;

    await client`INSERT INTO media (filename, url, mime_type, size, content, created_at) VALUES (${filename}, ${url}, ${mimeType}, ${buffer.length}, ${buffer}, ${new Date().toISOString()})`;

    console.log(`    -> Uploaded as ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
    return url;
  } catch (error) {
    console.error(`    -> Failed to upload:`, error);
    return null;
  }
}

migrateImages().catch(console.error);
