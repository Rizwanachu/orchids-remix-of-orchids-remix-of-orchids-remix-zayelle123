# Project Overview

A Next.js e-commerce web application (Zayelle - Premium Hijabs & Modest Accessories) with product browsing, cart, wishlist, checkout, and a comprehensive admin panel with full CMS capabilities.

## Tech Stack
- **Framework**: Next.js 15 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 with PostCSS
- **UI Components**: Radix UI primitives, shadcn/ui components
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts (used in admin analytics)
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: JWT (jsonwebtoken + jose) with HTTP-only cookies

## Database Schema
- `users` - id, name, email, password (bcrypt), phone, address, role (user/admin), createdAt
- `orders` - id, orderId (ZAY-XXXXX), userId, customerName, customerEmail, customerPhone, shippingAddress, totalAmount, paymentStatus, orderStatus, paymentMethod, couponCode, discountAmount, timestamps
- `order_items` - id, orderId, productName, productHandle, quantity, price, image
- `coupons` - id, code, discountType, discountValue, minOrderValue, maxUsage, currentUsage, expiryDate, active
- `products` - id, handle, name, subtitle, price, compareAt, image, hoverImage, badge, description, details, category, stockQuantity, lowStockThreshold, active, createdAt
- `admin_activity_logs` - id, adminId, adminEmail, action, details, createdAt
- `collections` - id, title, slug, subtitle, description, imageUrl, isFeatured, displayOrder, createdAt
- `new_arrivals` - id, productId (FK), displayOrder, createdAt
- `zayelle_edits` - id, imageUrl, title, subtitle, buttonText, redirectLink, displayOrder, createdAt
- `banners` - id, title, subtitle, buttonText, buttonLink, imageUrl, position (hero/mid-left/mid-right), isActive, createdAt
- `gift_hampers` - id, title, description, imageUrl, price, comparePrice, includedProductIds (int[]), displayOrder, isActive, createdAt
- `homepage_settings` - id, key (unique), value, updatedAt
- `homepage_sections` - id, sectionName (unique), label, isVisible, displayOrder
- `dm_testimonials` - id, imageUrl, alt, displayOrder, isActive, createdAt
- `reviews` - id, productId (FK), customerName, customerEmail, rating (1-5), comment, imageUrl, status (pending/approved/rejected), createdAt

## Project Structure
- `src/app/` - Next.js App Router pages
  - `admin/` - Admin panel (dashboard, orders, analytics, customers, products, collections, new-arrivals, banners, zayelle-edit, gift-hampers, dm-testimonials, coupons, homepage-settings, homepage-layout, activity)
  - `account/` - User account pages
  - `cart/`, `checkout/`, `wishlist/` - Shopping flow
  - `collections/`, `products/` - Product browsing
  - `api/` - API routes
- `src/app/api/admin/` - Admin API routes (all CMS features, orders, analytics, customers, coupons, activity, dm-testimonials, upload, login, logout)
- `src/app/api/` - Public API routes (collections, new-arrivals, banners, zayelle-edit, gift-hampers, dm-testimonials, homepage-settings, homepage-layout, orders, coupons, products, reviews)
- `src/components/` - Reusable UI components (sections, ui)
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utilities, context providers, admin auth helpers
- `server/db.ts` - Database connection (lazy init for Vercel compatibility)
- `shared/schema.ts` - Drizzle schema definitions
- `public/uploads/` - User-uploaded images
- `public/` - Static assets (icons, logos, manifest)

## Admin Panel (CMS)
- `/admin` - Dashboard with revenue, orders, avg value stats
- `/admin/login` - Admin login (JWT cookie auth)
- `/admin/orders` - Order management with filters, status changes, CSV export
- `/admin/analytics` - Sales charts (daily/monthly) with Recharts
- `/admin/customers` - Customer list with order stats
- `/admin/products` - Product CRUD management
- `/admin/collections` - Collection management (add/edit/delete/reorder)
- `/admin/new-arrivals` - New arrivals section management (select products, reorder)
- `/admin/banners` - Banner management (hero, mid-left, mid-right positions, active toggle)
- `/admin/zayelle-edit` - Curated grid section management (image grid CMS)
- `/admin/gift-hampers` - Gift hamper builder (product bundles)
- `/admin/coupons` - Coupon code management
- `/admin/homepage-settings` - Dynamic section titles/subtitles
- `/admin/homepage-layout` - Section ordering and visibility toggles
- `/admin/reviews` - Review moderation (approve/reject/delete, filter by status)
- `/admin/activity` - Admin activity log viewer
- Protected by middleware (JWT verification)

## Homepage Dynamic Sections
The homepage renders sections dynamically based on database configuration:
- Section order and visibility controlled via `/admin/homepage-layout`
- Section titles/subtitles editable via `/admin/homepage-settings` and consumed by frontend components (hero, collections-grid, new-arrivals-carousel, curated-grid)
- Collections, banners, curated grid, new arrivals, gift hampers all fetched from database APIs
- Gift hampers section renders on homepage with compare price support
- Fallback to default order if no DB config exists
- Default section order: hero, collections, new-arrivals, promo-banners, gift-hampers, zayelle-edit, instagram-feed, testimonials, trust-bar

## Development
- **Dev server**: `npm run dev` (runs on port 5000 with Turbopack)
- **Build**: `npm run build`
- **Start**: `npm start`
- **DB Push**: `npm run db:push` (drizzle-kit push)

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for admin JWT tokens
- `PGDATABASE`, `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD` - DB credentials

## Configuration
- Next.js configured to allow dev origins from Replit and Orchids
- Images allow remote patterns from any host
- TypeScript and ESLint errors ignored during builds
- Admin cookie uses sameSite=lax for cross-domain compatibility
- Path aliases: `@/` maps to `./src/`, use `@/../` for root-level `server/` and `shared/`
