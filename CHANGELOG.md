# Changelog

ACS Truck Operations follows Semantic Versioning (`MAJOR.MINOR.PATCH`).

## [1.1.1] - 2026-08-23

### Dashboard reporting correction
- Added a consistent management-period selector: This Month, This Year and All Time.
- Changed the default dashboard management view to This Year.
- Income, Expenses, Net P/L, Receivables, delivery counts, maintenance counts and recent records now use the same selected period.
- Removed the misleading mix of latest-month P&L with cumulative receivables.
- Added clear period labels so a zero-income month is not mistaken for zero historical income.

## [1.1.0] - 2026-08-22

### Production release
- Rebuilt the live application around a single production UI instead of legacy V2/V3 presentation layers.
- Added complete desktop management tables with search, sorting, page sizes, pagination, checkbox selection, select-all, CSV export and bulk archive.
- Added mobile-first record cards with clear field/value hierarchy and responsive action controls.
- Added dedicated create/edit workflows for deliveries, fuel, maintenance, vehicles and general income/expense transactions.
- Added editable master data for categories, customers and vendors.
- Added driver delivery progression: assigned → loaded → departed → arrived → delivered.
- Added receipt/document attachment upload and signed document access from human-readable record details.
- Added branded invoice PDF generation with company details, customer/delivery details, totals, terms and footer.
- Added Profit & Loss PDF export and day/week/month/quarter/half-year/year reporting with previous-period comparison.
- Added company branding, administrator user management and inactive-account enforcement.
- Added archive-based record safety instead of casual accounting deletion; linked delivery/fuel/maintenance financial transactions now archive consistently with their operational records.
- Added in-app PWA installation prompt, iOS Add to Home Screen guidance, service-worker update notification and offline connectivity indicator.
- Hardened the PWA manifest, metadata, shortcuts, theme and install icon.
- Added a global application error boundary and clearer account/profile access failure handling.
- Added visible application release version.
- Completed and reconciled the full historical transaction migration.
- Removed obsolete migration staging data and added missing database foreign-key indexes.
- Optimized RLS policies for production query execution without changing authorization semantics.
- Removed retired V2/V3 application code and unused Recharts dependency.
- Upgraded jsPDF to the patched 4.2.1 line after CI identified a critical advisory.
- CI now blocks releases on critical npm advisories, TypeScript errors or production build failures.

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
