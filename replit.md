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
- Products context (`src/lib/products-context.tsx`) properly throws errors on failed API calls.
- Multi-image gallery support: `gallery` TEXT column in products table stores JSON array of image URLs. Admin form supports upload/browse for gallery images. Product detail page shows all gallery images in the image selector.
- Collections page shows product count per collection, allows viewing/adding/removing products from collections.
- New Arrivals admin page has searchable product picker with images, drag-to-reorder functionality.
- Zayelle Edit admin page has product/collection picker for redirect links. Also supports collections-style product management: add/remove products per edit item, view product count inline, stored as JSON array in `product_ids` TEXT column.
- Header "All Products" nav item shows a hover dropdown listing all collections (with images) from `/api/collections`. Mobile menu has an expandable accordion for the same.
- Products page has a Filters panel (toggle button) with collection filter chips and price range inputs (with quick presets). Supports `?collection=slug` URL parameter for deep linking from header dropdown.
- Public products page has category filter chips and sort dropdown (Newest, Price Low-High, Price High-Low, Name A-Z).

## Admin Panel - Banners
- Banner image upload limit: 10MB (via `/api/admin/upload`).
- Position options: Hero (horizontal/wide), Mid Left (square/vertical), Mid Right (square/vertical).
- Form shows error/success messages for uploads and save operations.
- Image preview uses `object-contain` to show any aspect ratio.

## Performance Notes
- All product images migrated from base64 to media URLs (March 2026). API response dropped from 25-74s to <200ms.
- Migration script at `scripts/migrate-base64-images.ts` can be re-run safely (skips products already using URLs).

## Deployment
- Deployed on Vercel.
- Ensure `DATABASE_URL` and `JWT_SECRET` environment variables are set in Vercel.
- Admin login issue on Vercel fixed by properly handling the `secure` cookie flag.
- "Internal Server Error" issues resolved by adding fallback responses to API routes.
