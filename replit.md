# Project Overview

A Next.js e-commerce web application (Zayelle - Premium Hijabs & Modest Accessories) with product browsing, cart, wishlist, checkout, and a comprehensive admin panel.

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
- `admin_activity_logs` - id, adminId, adminEmail, action, details, createdAt

## Project Structure
- `src/app/` - Next.js App Router pages
  - `admin/` - Admin panel (dashboard, orders, analytics, customers, products, coupons, activity)
  - `account/` - User account pages
  - `cart/`, `checkout/`, `wishlist/` - Shopping flow
  - `collections/`, `products/` - Product browsing
  - `api/` - API routes
- `src/app/api/admin/` - Admin API routes (orders, analytics, customers, coupons, activity, login, logout)
- `src/app/api/orders/` - Order creation and retrieval
- `src/app/api/coupons/` - Coupon validation
- `src/components/` - Reusable UI components (sections, ui)
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utilities, context providers, admin auth helpers
- `server/db.ts` - Database connection
- `shared/schema.ts` - Drizzle schema definitions
- `public/` - Static assets (icons, logos, manifest)

## Admin Panel
- `/admin` - Dashboard with revenue, orders, avg value stats
- `/admin/login` - Admin login (JWT cookie auth)
- `/admin/orders` - Order management with filters, status changes, CSV export
- `/admin/analytics` - Sales charts (daily/monthly) with Recharts
- `/admin/customers` - Customer list with order stats
- `/admin/products` - Product CRUD management
- `/admin/coupons` - Coupon code management
- `/admin/activity` - Admin activity log viewer
- Protected by middleware (JWT verification)

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
