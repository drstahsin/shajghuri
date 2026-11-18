# Shajghuri

Shajghuri is a Next.js storefront and admin dashboard for a Bangladesh ornaments business. The catalog is public; customer orders and admin functions are private.

## Local setup

1. Install Node.js 20.9 or newer and run `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Set `ADMIN_PASSWORD` to a private password with at least 14 characters. Set `ADMIN_SESSION_SECRET` to a separate random value with at least 32 characters.
4. For local development, `DATABASE_URL` may be left blank. Local order data is kept in the ignored `data/orders.local.json` file.
5. Run `npm run dev` and open `http://localhost:3000`.

## Vercel deployment and order storage

Production requires a durable PostgreSQL database. Vercel's current Marketplace provides PostgreSQL integrations such as Neon; connect one to the Vercel project and set its pooled connection string as `DATABASE_URL`. The application creates its tables and seeds the catalog from `data/products.json` the first time it connects. **The storefront will not accept orders in production without `DATABASE_URL`.**

Set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in Vercel's project environment settings for Production and Preview. Use different credentials in Preview. Never add real values to Git or prefix secrets with `NEXT_PUBLIC_`.

To preserve existing local order history, connect the project to the new database before deployment and run `npm run db:migrate:orders` once. The script will copy local order records and will not change product stock. Keep the local file until the migration reports success, then remove the local copy when no longer needed.

Order confirmation and contact inquiry emails use SMTP. Set `EMAIL_USER` and `EMAIL_APP_PASSWORD` in the Vercel project settings to enable them. If SMTP is not configured, order placement still works and the admin can see orders; the contact form displays a delivery error and points customers to the published phone/email details.

## Security behavior

- Admin APIs require a short-lived, signed, `httpOnly`, `SameSite=Strict` session cookie.
- Customer order details can be fetched only with the random access token returned at checkout; the token is kept in the browser tab's session storage.
- Order totals and item prices come from the server catalog. Stock is checked and updated in the same PostgreSQL transaction as the order.
- Customers pay the calculated delivery fee upfront by bKash or Nagad and provide the sender number and transaction ID. The order remains pending for manual wallet verification; the jewelry subtotal is due in cash on delivery.
- Production order/catalog storage uses PostgreSQL. Local JSON order data is ignored by Git.
- API requests are size-limited, validated, origin-checked for writes, and rate-limited. Production rate limits are stored in PostgreSQL.
- Product images are restricted to local catalog assets. Standard security response headers are configured in `next.config.ts`.

## Available commands

- `npm run dev` — start the development server
- `npm run lint` — run ESLint
- `npm run build` — build for production
- `npm run db:migrate:orders` — import local order history into the configured database once
