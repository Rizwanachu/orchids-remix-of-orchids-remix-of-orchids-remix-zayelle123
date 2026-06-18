# Zayelle Project

## Features
- E-commerce platform with admin panel.
- JWT-based admin authentication.
- PostgreSQL database with Drizzle ORM.
- Contact form saves messages to `contact_messages` table.

## Admin Authentication
- Login at `/letsgetsuccessin2026/login`.
- JWT token stored in `admin_token` cookie.
- `secure` flag in cookie is only set to `true` in production to allow local testing.
- Middleware and server-side verification updated to handle production vs development differences.

## Database
- Using Replit's managed PostgreSQL.
- Schema defined in `shared/schema.ts`.
- Media and data are stored in the PostgreSQL database.
- Database tables initialized using `drizzle-kit push`.
- API routes updated with error handling to prevent frontend crashes when data is missing.
- Product images stored as URLs (`/api/media/serve/filename`) pointing to media table, NOT as base64 strings.

## Admin Panel - Products
- Product image upload uses server-side upload via `/api/admin/upload` (not base64 encoding).
- Save button shows loading state and validation errors for missing required fields.
- Form includes shippingPolicy and returnPolicy text fields (UI only, not yet in DB schema).
- **Inventory section extended**: `costPrice` (NUMERIC), `weight` (TEXT), `estimatedShipping` (TEXT) columns added to products table. Admin form shows all three fields plus a live-calculated Profit Margin display.
- **"Only X Left" badge**: Product detail page shows an animated red badge when `stockQuantity > 0 && stockQuantity <= lowStockThreshold`.
- Products context (`src/lib/products-context.tsx`) properly throws errors on failed API calls.
- Multi-image gallery support: `gallery` TEXT column in products table stores JSON array of image URLs. Admin form supports upload/browse for gallery images. Product detail page shows all gallery images in the image selector.
- Collections page shows product count per collection, allows viewing/adding/removing products from collections.
- New Arrivals admin page has searchable product picker with images, drag-to-reorder functionality.
- Zayelle Edit admin page has product/collection picker for redirect links. Also supports collections-style product management: add/remove products per edit item, view product count inline, stored as JSON array in `product_ids` TEXT column.
- Header "All Products" nav item shows a hover dropdown listing all collections (with images) from `/api/collections`. Mobile menu has an expandable accordion for the same.
- Products page has a Filters panel (toggle button) with collection filter chips and price range inputs (with quick presets). Supports `?collection=slug` URL parameter for deep linking from header dropdown.
- Public products page has category filter chips and sort dropdown (Newest, Price Low-High, Price High-Low, Name A-Z).
- **Dynamic Categories**: Categories stored in `categories` table. Admin can add/edit/delete categories inline via "Manage" button on category dropdown. API: `/api/admin/categories` (CRUD), `/api/categories` (public GET). Default categories seeded on first access.
- **Dynamic Badges**: Badges stored in `badges` table. Admin can add/edit/delete badges inline via "Manage" button on badge dropdown. API: `/api/admin/badges` (CRUD). Default badges (New, Sale, Bestseller, Gift) seeded on first access.
- **Product Templates**: Saved in `product_templates` table. Admin can save current product details (description, details, dimension, material, careInstructions, shippingPolicy, returnPolicy) as a named template. "Load Template" dropdown auto-fills these fields. Templates manageable (edit/delete) via "Manage Templates" panel. API: `/api/admin/product-templates` (CRUD).
- **Kerala / Outside Kerala Shipping**: Products have two shipping cost fields: `shippingCostKerala` (default 49) and `shippingCost` (outside Kerala). Admin form shows both fields side by side. Checkout page dynamically switches shipping cost based on selected state — uses Kerala rate when state is "Kerala", outside Kerala rate otherwise. Shipping label shows which rate is applied.
- **Product Colors**: Global color pool stored in `product_colors` table (id, name, hexValue). Products store selected colors as JSON array of `{name, hex}` in `colors` TEXT column. Admin form has a "Color Variants" section with clickable swatch selector + "Manage" panel for CRUD. Product detail page shows color swatches with hover tooltips. API: `/api/admin/product-colors` (GET/POST), `/api/admin/product-colors/[id]` (PATCH/DELETE).

## Admin Panel - Abandoned Carts
- `abandoned_carts` table (id, customer_name, phone, email, products JSON, cart_value, status, notes, created_at).
- Admin CRUD at `/letsgetsuccessin2026/abandoned-carts`: status pipeline (Pending → Contacted → Recovered → Lost), filter tabs, expandable rows with cart items + notes, one-click WhatsApp follow-up, inline status dropdown.
- Admin API: `/api/admin/abandoned-carts` (GET/POST) and `/api/admin/abandoned-carts/[id]` (PATCH/DELETE).
- Public capture: POST to `/api/admin/abandoned-carts` when a cart is abandoned.

## Admin Panel - SEO Manager
- `seo_settings` table (page_path UNIQUE, meta_title, meta_description, keywords, canonical_url, og_image, updated_at).
- Admin CRUD at `/letsgetsuccessin2026/seo`: card per page (Homepage, Products, Collections, etc. + custom paths), inline edit with character-count indicators, live Google search preview.
- Admin API: `/api/admin/seo` (GET + upsert POST). Sidebar: "SEO Manager" link added.

## Admin Panel - Banners
- Banner image upload limit: 10MB (via `/api/admin/upload`).
- Position options: Hero (horizontal/wide), Mid Left (square/vertical), Mid Right (square/vertical).
- Form shows error/success messages for uploads and save operations.
- Image preview uses `object-contain` to show any aspect ratio.
- **Banner Type** dropdown (Homepage / Sale / New Arrivals / Collection / Seasonal) — stored in `banner_type` column.
- **Schedule Start / End** datetime inputs for timed banners — stored in `schedule_start` / `schedule_end` columns.

## Performance Notes
- All product images migrated from base64 to media URLs (March 2026). API response dropped from 25-74s to <200ms.
- Migration script at `scripts/migrate-base64-images.ts` can be re-run safely (skips products already using URLs).
- Lightweight `/api/products/search` endpoint added for header search bar (2.6KB vs 47KB full endpoint).

## Image Delivery Optimization (April 2026)
- **Problem**: Cloudinary report showed ~99% of bandwidth was raw originals (PNG 67.75% / JPG 31.28%, only ~0.6% transformed) — 22.75 GB / 13.15K requests in 30 days.
- **Root causes**:
  1. `next/image` loader used fixed `q_70` and allowed `w_3840` (4K downloads).
  2. `/api/media/serve/[filename]` 301-redirected to the **raw** Cloudinary URL (no transforms) — emails, OG scrapers, and old links all pulled multi-MB originals.
  3. Many raw `<img>` tags in admin/account pages and email templates pointed straight at the original Cloudinary URL.
- **Fixes**:
  - `src/lib/optimize-cloudinary.ts` — new helper `optimizeCloudinaryUrl(url, { width })` that injects `f_auto,q_auto,w_W,c_limit,dpr_auto`, stripping any pre-existing transforms. Width is clamped to 1920.
  - `src/lib/image-loader.ts` — switched from `q_70` → `q_auto` (smart compression) and capped width at 1920 (was 3840).
  - `next.config.ts` — explicit `deviceSizes: [360, 640, 750, 828, 1080, 1200, 1600, 1920]` and `imageSizes` so `<Image srcset>` never requests 4K variants.
  - `src/app/api/media/serve/[filename]/route.ts` — wraps the redirect target with `optimizeCloudinaryUrl` (default `w=1600`, overridable via `?w=` query param).
  - `src/lib/email.ts` — `toAbsoluteUrl` now optimizes Cloudinary URLs to `w=144` for email thumbnails.
  - All raw `<img>` tags in `src/app/pages/track-order/page.tsx`, `src/app/account/orders/page.tsx`, and admin pages (`orders`, `dm-testimonials`, `products`, `dashboard`, `site-settings`) wrapped with `optimizeCloudinaryUrl({ width: thumb-size })`.
- **Expected impact**: bandwidth reduction of ~70–85% (raw 4 MB PNG → ~300–500 KB WebP/AVIF served by Cloudinary CDN with smart quality).

## Image Storage — Cloudinary Migration (COMPLETE — March 2026)
- **291 of 292 images migrated** from Neon PostgreSQL bytea → Cloudinary. 1 file failed (corrupted: `10b7e479585a40f92e6e3ad46af6b4ef.jpg`).
- All 9 affected table columns updated to direct Cloudinary URLs (no more `/api/media/serve/` indirection for migrated images).
- URL map backup: `scripts/cloudinary-url-map.json`.
- `media` table has a `cloudinary_url` (TEXT, nullable) column. All rows with migrated images have this set.
- Cloudinary client: `src/lib/cloudinary.ts` using `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- **Upload route** (`/api/admin/upload`): Uploads new images directly to Cloudinary; stores `cloudinary_url` in DB; legacy `content` bytea is empty buffer for new uploads.
- **Serve route** (`/api/media/serve/[filename]`): Redirects (301) to `cloudinary_url` if set; falls back to serving bytea content for the 1 failed/legacy file.
- **Migration script** (`scripts/migrate-to-cloudinary.ts`): Safe to re-run — fetches only rows without `cloudinary_url`, one at a time to avoid OOM. Run with: `npx tsx --env-file=.env.local scripts/migrate-to-cloudinary.ts`
- Affected columns: `products.image`, `products.hover_image`, `products.gallery` (JSON), `products.colors` (nested JSON), `banners.image_url`, `collections.image_url`, `zayelle_edits.image_url`, `dm_testimonials.image_url`, `order_items.image`.
- **Media delete** (`/api/admin/media`): Also deletes from Cloudinary when `cloudinary_url` is set.
- **Expected impact**: ~60 GB/month Neon transfer eliminated; Cloudinary CDN now serves images globally with automatic compression.

## Community Testimonials (Our Community Speaks)
- `community_testimonials` table in DB (fields: id, quote, author, location, rating, is_active, display_order, created_at).
- Admin CRUD at `/letsgetsuccessin2026/testimonials` (add, edit, toggle active, delete, star rating picker).
- Admin API: `/api/admin/testimonials` (GET, POST) and `/api/admin/testimonials/[id]` (PATCH, DELETE).
- Public API: `/api/testimonials` (returns only active testimonials ordered by display_order).
- Frontend `src/components/sections/testimonials.tsx` fetches from `/api/testimonials` on mount; falls back to 4 hardcoded testimonials if API fails or returns empty.
- Sidebar link "Testimonials" added to admin layout.

## Responsiveness
- All product grid pages (products, new-arrivals, gift-hampers, collections/[slug], wishlist) have touch-accessible wishlist and add-to-cart buttons: buttons are always visible on mobile (<640px) and hover-only on desktop, using `sm:opacity-0 sm:group-hover:opacity-100` pattern.
- New Arrivals carousel (homepage) same fix applied to wishlist icon group and AddToCartButton.
- Product detail page price badge row uses `flex-wrap` to prevent overflow of "X% OFF (SAVE ₹X)" badge on narrow screens.
- Admin dashboard outer container uses `p-4 md:p-8` with a responsive header that stacks on mobile.

## Admin Panel - Bundles
- Bundles CRUD at `/letsgetsuccessin2026/bundles`.
- `product_bundles` table (id, name, description, bundle_type, items JSON, price, compare_price, badge, image_url, is_active, display_order, created_at).
- Admin form: product picker with search + quantity per item, image upload via Cloudinary, badge field, compare price, enable/disable toggle, display order.
- Public API: `/api/bundles` (returns active bundles ordered by display_order). Admin API: `/api/admin/bundles` (GET/POST) and `/api/admin/bundles/[id]` (PATCH/DELETE).
- Homepage "Most Loved Bundles" section fetches from `/api/bundles` with fallback to product images when empty.

## Admin Panel - WhatsApp Leads CRM
- WhatsApp Leads CRM at `/letsgetsuccessin2026/whatsapp-leads`.
- `whatsapp_leads` table (id, phone, name, source_page, product_name, product_handle, message, status, notes, created_at).
- Lead auto-captured when customer clicks WhatsApp CTA on any product page (silent POST to `/api/whatsapp-leads`).
- Admin view: leads list with status pipeline (New → Contacted → Interested → Ordered → Closed → Lost), filter by status with counts, expandable rows for notes, one-click WhatsApp Chat button, inline status update dropdown.
- Public capture API: `/api/whatsapp-leads` (POST). Admin API: `/api/admin/whatsapp-leads` (GET) and `/api/admin/whatsapp-leads/[id]` (PATCH/DELETE).

## CRO Enhancements (Homepage & Product Pages)
- Homepage: dual hero CTAs, WhatsApp strip, bundles section, limited edition banner, 4-item trust bar.
- Section order enforced via CANONICAL_ORDER in `src/app/page.tsx`.
- Product page: delivery estimate block, WhatsApp CTA (with lead capture), 2×2 trust grid, Customer Questions FAQ accordion (5 Q&As).
- Cart page: free shipping progress bar, upsell grid (4 items), trust signals in sidebar.
- Checkout page: delivery estimate + 4 trust signals in order summary.

## Deployment
- Deployed on Vercel.
- Required Vercel environment variables: `DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- Admin login issue on Vercel fixed by properly handling the `secure` cookie flag.
- "Internal Server Error" issues resolved by adding fallback responses to API routes.
