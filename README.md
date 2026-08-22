# ACS Truck Operations

**Current release: v1.1.0**

Production fleet, delivery, income/expense, maintenance, reporting and invoicing PWA for Avenue Construction Supply GH Ltd.

## Stack

- React + TypeScript + Vite
- Supabase Auth, PostgreSQL, Storage and Realtime
- vite-plugin-pwa
- jsPDF invoice/document generation
- Docker + nginx production image

## Frontend setup

1. Copy `.env.example` to `.env`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the dedicated `acs-truck` Supabase project.
3. Run `npm install`.
4. Run `npm run dev` for development or `npm run build` for a production build.

## Production target

`https://truck.constructionsupplyghonline.com`

Production must use HTTPS for service workers and PWA installation. SPA requests must route back to `index.html`. The included Docker/nginx files support self-hosted deployment; the current frontend can also deploy through Vercel.

## PWA installation

- Chrome/Edge/Android: use the browser Install option or the in-app **Install ACS Truck** button when shown.
- iPhone/iPad: Safari → Share → **Add to Home Screen**. The app displays this guidance when appropriate.
- Installed copies run in standalone mode with ACS Truck branding.
- New releases surface an in-app update prompt instead of silently leaving staff on an old cached build.
- The service worker caches the application shell only; financial/API responses remain live from Supabase.

## Roles

- `admin` — full operational, configuration and user-administration access
- `operations` — deliveries, fleet and operational entries
- `accounts` — financial/reporting access
- `driver` — assigned delivery workflow and permitted field entries

Inactive users are blocked at the application and database role layer.

## Core modules

- Dashboard
- Income: deliveries, transport service and other income
- Expenses: fuel, maintenance and other expenses
- Reports: day/week/month/quarter/half-year/year with previous-period comparison
- Fleet
- Company/profile/user administration
- Customer/vendor/category configuration
- Invoice/PDF generation
- Controlled document storage

## Financial model

Configurable income and expense categories feed one transaction register. P&L is calculated from database transactions rather than spreadsheet formulas. Delivery income, fuel and maintenance are synchronized into the financial engine so users do not have to duplicate entries. Records are archived rather than casually deleted.

## Historical migration

Original spreadsheet references are preserved. Blank-amount companion rows remain at GHS 0.00. Maintenance/repair/service descriptions take classification priority when a row also mentions fuel/top-up. The historical migration was reconciled against all dated source rows before production hardening.

## Releases

See `CHANGELOG.md` for release history and `PRODUCTION.md` for production checks and deployment procedures. Semantic Versioning is used.

## CI

GitHub Actions and Vercel preview builds validate changes before they are merged to `main`.
