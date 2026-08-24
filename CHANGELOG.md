# Changelog

ACS Truck Operations follows Semantic Versioning (`MAJOR.MINOR.PATCH`).

## [1.3.0] - 2026-08-24

### Frontend consolidation and production architecture
- Replaced the layered `ProductionApp + V12 overrides` runtime with one consolidated lazy-loaded application shell.
- Introduced TanStack Query as the single server-state/cache layer with targeted query invalidation and reconnect behavior.
- Dashboard now loads a small PostgreSQL aggregate RPC instead of downloading the operational ledger.
- Profit & Loss reporting now uses a PostgreSQL aggregate RPC with current/previous periods and category summaries.
- Operational registers now use true server-side pagination, search, date ranges and sorting.
- Realtime now uses one subscription layer and invalidates only the affected query families instead of reloading the entire application.
- Removed MutationObserver/querySelector feature overrides and synthetic-click navigation from the mounted application.
- Rebuilt delivery, income/expense, fuel, maintenance and vehicle forms as direct React workflows.
- Attachments now save against the exact ID returned by the record insert/update, removing the old delayed “latest record” race condition.
- Moved duplicate-vehicle merge into one PostgreSQL transaction so linked records cannot be left half-migrated.
- Consolidated Settings, profile, company branding, master-data management and administrator user controls into the main application.
- Removed broad Supabase REST Cache API interception; permission/profile requests are never served from the former stale-response cache layer.
- Added page-level lazy loading, loading/error/empty states, compact mobile record cards and stable persisted navigation.
- Added the first automated Vitest release tests and made tests a required CI release gate.
- Retained the v1.2.2 pre-React PWA recovery/update shell while simplifying the runtime connection layer.

## [1.2.2] - 2026-08-24

### PWA update recovery
- Added pre-React startup recovery controls for installed apps that cannot finish loading.
- Changed service-worker releases to activate automatically and reload when the new worker controls the app.
- Added Use latest version, Retry and Repair app cache recovery actions outside the React/data-loading path.

## [1.2.1] - 2026-08-23

### Startup performance and resilience
- Added an immediate HTML/PWA startup shell so installed and browser launches never sit on a blank white screen while JavaScript initializes.
- Added user-scoped Cache Storage for Supabase REST reads. Recent data can be rendered immediately during startup while a background refresh checks the server.
- Changed later manual refreshes to network-first behavior with cached fallback, so Refresh still retrieves current data rather than repeatedly showing stale cache.
- Added request timeouts and visible connectivity/data-refresh warnings instead of silent failures or empty registers.
- Added explicit session/profile startup states and recoverable Retry/Sign-out actions when authentication or profile loading is slow or unavailable.
- Added online/offline and successful-refresh status feedback.
- Preserved the user's last main navigation page across ordinary app reopen/reload instead of always forcing Dashboard.
- Added production indexes for active transactions, deliveries, fuel, maintenance and fleet list queries.
- Data cache is isolated per authenticated user and cleared on sign-out.

## [1.2.0] - 2026-08-23

### Operational refinement
- Rebuilt the Profit & Loss PDF into a structured management statement with company identity, summary metrics, separate income and expense statements, net profit/loss, prior-period comparison and footer.
- Standardized PDF financial values as `GHS 1,234.56` to avoid unsupported cedi-symbol glyph rendering.
- Added custom From/To date-range reporting in addition to day, week, month, quarter, half-year and year presets.
- Added fleet bulk status editing and duplicate-vehicle merge tools with confirmation and linked-record reassignment.
- Consolidated spreadsheet-created false vehicle registrations into GS-826-10; active fleet now contains GS-1787-26 and GS-826-10.
- Added quick Customer, Vendor and Vehicle creation directly from operational entry dialogs.
- Added receipt/invoice/document selection during delivery, income/expense, fuel and maintenance entry; selected files attach after the record is saved.
- Replaced invoice PDF output with a more structured company/customer/delivery document and GHS-safe currency formatting.
- Made sortable table headers visually explicit and further reduced mobile record-card density.
- Bumped production release identity to v1.2.0.

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
- Added a global application error boundary and visible application release version.
- Completed and reconciled the full historical transaction migration.
- Removed obsolete migration staging data and added missing database foreign-key indexes.
- Upgraded jsPDF to the patched 4.2.1 line after CI identified a critical advisory.
- CI blocks releases on critical npm advisories, TypeScript errors or production build failures.

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
- **PATCH** (`1.3.1`) — bug fixes, copy/layout corrections and security patches with no workflow changes.
- **MINOR** (`1.4.0`) — backward-compatible features and workflow improvements.
- **MAJOR** (`2.0.0`) — breaking workflow/schema changes or a major platform redesign.
