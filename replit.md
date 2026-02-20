# Project Overview

A Next.js e-commerce web application with product browsing, cart, wishlist, checkout, and admin features.

## Tech Stack
- **Framework**: Next.js 15 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 with PostCSS
- **UI Components**: Radix UI primitives, shadcn/ui components
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts

## Project Structure
- `src/app/` - Next.js App Router pages (account, admin, cart, checkout, collections, products, wishlist, etc.)
- `src/components/` - Reusable UI components (sections, ui)
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utilities, context providers (auth, cart, orders, products)
- `public/` - Static assets (icons, logos, manifest)

## Development
- **Dev server**: `npm run dev` (runs on port 5000 with Turbopack)
- **Build**: `npm run build`
- **Start**: `npm start`

## Configuration
- Next.js configured to allow dev origins from Replit and Orchids
- Images allow remote patterns from any host
- TypeScript and ESLint errors ignored during builds
