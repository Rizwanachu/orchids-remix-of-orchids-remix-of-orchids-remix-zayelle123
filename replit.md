# Zayelle Project

## Features
- E-commerce platform with admin panel.
- JWT-based admin authentication.
- PostgreSQL database with Drizzle ORM.

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

## Deployment
- Deployed on Vercel.
- Ensure `DATABASE_URL` and `JWT_SECRET` environment variables are set in Vercel.
- Admin login issue on Vercel fixed by properly handling the `secure` cookie flag.
- "Internal Server Error" issues resolved by adding fallback responses to API routes.