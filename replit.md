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
- **Auth**: JWT (jsonwebtoken + jose) with HTTP-only cookies (both admin and user auth)
- **Email**: Nodemailer with Gmail SMTP for transactional emails

## Database Schema
- `users` - id, name, email, password (bcrypt), phone, address, role (user/admin), createdAt
- `orders` - id, orderId (ZAY-XXXXX), userId, customerName, customerEmail, customerPhone, shippingAddress, totalAmount, paymentStatus, orderStatus, paymentMethod, razorpayOrderId, razorpayPaymentId, trackingNumber, trackingCarrier, couponCode, discountAmount, timestamps
- `order_items` - id, orderId, productName, productHandle, quantity, price, image
- `coupons` - id, code, discountType, discountValue, minOrderValue, maxUsage, currentUsage, expiryDate, active
- `products` - id, handle, name, subtitle, price, compareAt, image, hoverImage, badge, description, details, shippingPolicy, returnPolicy, category, stockQuantity, lowStockThreshold, active, createdAt
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
- `site_settings` - id, key (unique), value, updatedAt — stores header/footer configuration as key-value pairs
- `page_contents` - id, slug (unique), title, content (HTML), metaTitle, metaDescription, isPublished, updatedAt — CMS for static pages

## Project Structure
- `src/app/` - Next.js App Router pages
  - `admin/` - Admin panel (dashboard, orders, analytics, customers, products, collections, new-arrivals, banners, zayelle-edit, gift-hampers, dm-testimonials, coupons, homepage-settings, homepage-layout, site-settings, page-contents, activity)
  - `account/` - User account pages (login, signup, forgot-password, orders, profile)
  - `api/auth/` - User auth routes (login, signup, me, reset-password)
  - `cart/`, `checkout/`, `wishlist/` - Shopping flow
  - `collections/`, `products/` - Product browsing
  - `api/` - API routes
- `src/app/api/admin/` - Admin API routes (all CMS features, orders, analytics, customers, coupons, activity, dm-testimonials, upload, login, logout)
- `src/app/api/` - Public API routes (collections, new-arrivals, banners, zayelle-edit, gift-hampers, dm-testimonials, homepage-settings, homepage-layout, orders, orders/[id]/invoice, coupons, products, reviews)
- `src/lib/generate-invoice-pdf.ts` - PDFKit invoice generator helper
- `src/lib/email.ts` - Gmail SMTP email utility (order confirmation + shipping notification)
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
- `/admin/orders` - Order management with filters, order status & payment status dropdowns, CSV export, full order editing (customer details, item quantities, remove items with total recalculation)
- `/admin/analytics` - Sales charts (daily/monthly) with Recharts, custom date range picker (presets: 7/30/90 days, this year, all time + custom from/to)
- `/admin/customers` - Customer list with order stats, edit/delete customers, view full order history
- `/admin/products` - Product CRUD with stock management (stockQuantity/lowStockThreshold fields, low/out of stock badges), bulk actions (select all, bulk delete, set category, toggle active)
- `/admin/media` - Media library (grid view of uploaded images, upload/delete, reusable MediaPickerModal for image selection across admin)
- `/admin/collections` - Collection management (add/edit/delete/reorder)
- `/admin/new-arrivals` - New arrivals section management (select products, reorder)
- `/admin/banners` - Banner management (hero, mid-left, mid-right positions, active toggle)
- `/admin/zayelle-edit` - Curated grid section management (image grid CMS)
- `/admin/gift-hampers` - Gift hamper builder (product bundles)
- `/admin/coupons` - Coupon code management
- `/admin/homepage-settings` - Dynamic section titles/subtitles
- `/admin/homepage-layout` - Section ordering and visibility toggles
- `/admin/reviews` - Review moderation (approve/reject/delete, filter by status)
- `/admin/site-settings` - Header & footer CMS (navigation items, logo, announcement bar, footer links, contact info, social links)
- `/admin/page-contents` - Page content CMS (edit all static pages: About Us, FAQ, Shipping Policy, etc.)
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

## Payment Integration
- **Razorpay** integrated for online payments (UPI, cards, net banking, wallets)
- COD orders: ₹49 surcharge, order created directly with paymentStatus "unpaid"
- Online orders: Razorpay checkout modal opens, payment verified server-side, order created with paymentStatus "paid"
- API routes: `/api/razorpay/config` (public key), `/api/razorpay/create-order` (create Razorpay order), `/api/razorpay/verify` (verify payment + create order)
- Razorpay payment ID stored in orders table and visible in admin order details

## User Authentication
- Login/signup uses database `users` table with bcrypt password hashing
- JWT token stored in `user_token` httpOnly cookie (7-day expiry)
- Auth context (`src/lib/auth-context.tsx`) calls API routes, no localStorage
- Password reset via email + phone verification at `/account/forgot-password`
- My Orders page fetches from database API, not localStorage

## Email Notifications
- Gmail SMTP via nodemailer (`src/lib/email.ts`)
- Order confirmation email sent on order placement (COD + Razorpay)
- Shipping notification email sent when admin changes status to "shipped"
- Tracking number included in shipping email if available
- Gracefully skips if Gmail credentials not configured

## Order Tracking
- Admin can add tracking number + carrier when order is shipped/delivered
- Track order page (`/pages/track-order`) shows tracking info
- Customer "My Orders" page shows tracking details

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for admin JWT tokens
- `RAZORPAY_KEY_ID` - Razorpay API Key ID
- `RAZORPAY_KEY_SECRET` - Razorpay API Key Secret
- `GMAIL_USER` - Gmail address for sending emails
- `GMAIL_APP_PASSWORD` - Gmail App Password for SMTP
- `PGDATABASE`, `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD` - DB credentials

## Configuration
- Next.js configured to allow dev origins from Replit and Orchids
- Images allow remote patterns from any host
- TypeScript and ESLint errors ignored during builds
- Admin cookie uses sameSite=lax for cross-domain compatibility
- Path aliases: `@/` maps to `./src/`, use `@/../` for root-level `server/` and `shared/`
