# Changelog

ACS Truck Operations follows Semantic Versioning (`MAJOR.MINOR.PATCH`).

## [1.1.0] - 2026-08-22

### Production hardening
- Added in-app PWA installation prompt and iOS Add to Home Screen guidance.
- Added service-worker update notification and one-click app update.
- Added offline connectivity indicator.
- Hardened PWA manifest, app metadata, shortcuts, theme and install icon.
- Added branded PDF invoice generation and human-readable record details.
- Added company branding, administrator user management and inactive-account enforcement.
- Added archive-based record safety instead of casual accounting deletion.
- Added responsive mobile-first income, expense, reports, fleet and administration views.
- Added day/week/month/quarter/half-year/year reporting with prior-period comparison.
- Completed and reconciled historical transaction migration.
- Removed obsolete migration staging data and added missing database foreign-key indexes.
- Removed unused Recharts dependency.

## [1.0.0] - 2026-08-22

### Initial production baseline
- Supabase authentication, PostgreSQL, RLS, Storage and Realtime foundation.
- Delivery, income/expense, fuel, fleet and maintenance registers.
- Configurable transaction categories, customers, vendors and roles.
- Monthly P&L and delivery profitability views.
- Receipt/invoice/document storage.
- Historical workbook migration and audit metadata.
- Docker/nginx and Vercel-ready frontend deployment.

## Version policy
- **PATCH** (`1.1.1`) — bug fixes, copy/layout corrections, security patches with no workflow changes.
- **MINOR** (`1.2.0`) — backward-compatible features such as new reports, approval workflows or notification capabilities.
- **MAJOR** (`2.0.0`) — breaking workflow/schema changes or major platform redesigns.
