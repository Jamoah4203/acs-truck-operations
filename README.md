# ACS Truck Operations

Mobile-first fleet, delivery, expense and maintenance operations PWA for Avenue Construction Supply GH Ltd.

## Stack

- React + TypeScript + Vite
- Supabase Auth, PostgreSQL, Storage and Realtime
- vite-plugin-pwa
- Docker + nginx production image

## Frontend setup

1. Copy `.env.example` to `.env`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the dedicated `acs-truck` Supabase project.
3. Run `npm install`.
4. Run `npm run dev` for development or `npm run build` for a production build.

## Production target

`https://truck.constructionsupplyghonline.com`

The production host must serve HTTPS for PWA installation and should route SPA requests to `index.html`. The included `Dockerfile` and `nginx.conf` provide the production container setup.

## First account

The database bootstrap makes the first authenticated profile the administrator. After the first admin exists, create/manage subsequent staff accounts according to their operational roles.

## Roles

- `admin` — full operational and configuration access
- `operations` — deliveries, fleet and operational entries
- `accounts` — financial/reporting access
- `driver` — assigned delivery workflow and permitted field entries

## Financial model

The database stores configurable income and expense categories. Monthly P&L is calculated from the transaction register rather than spreadsheet formulas. Delivery-related income/expenses can be linked to a delivery for contribution reporting. Receipts and invoices are stored in the private `truck-documents` bucket.

## Historical migration rules

Original spreadsheet references are preserved. Blank-amount companion rows are retained at GHS 0.00. Maintenance/repair/service descriptions take classification priority when a row also mentions fuel/top-up. Genuinely ambiguous historical rows are marked for review instead of silently discarded.

## CI

GitHub Actions builds `main`, `develop`, and pull requests to catch TypeScript/Vite build failures before deployment.
