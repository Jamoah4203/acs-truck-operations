# ACS Truck Operations — Production Runbook

Current release: **v1.1.0**

## Required production configuration

- Serve only over HTTPS.
- Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the frontend host.
- Production hostname: `https://truck.constructionsupplyghonline.com`.
- Supabase project: dedicated `acs-truck` project only.
- Keep the Supabase service-role key out of the browser/frontend.
- Maintain RLS on all exposed operational tables.

## PWA validation

A production deployment should pass these checks:

1. Chrome/Edge shows the browser Install option.
2. The in-app **Install ACS Truck** button appears when the browser exposes `beforeinstallprompt`.
3. Installed app launches standalone from its home-screen/desktop icon.
4. New deployments show an **Update now** prompt when a new service worker is ready.
5. Offline mode displays a visible connectivity notice and cached application shell remains available.
6. No financial/API responses are deliberately cached by the service worker; Supabase remains the live source of truth.

On iOS Safari, installation uses **Share → Add to Home Screen**; the application displays this guidance in-app.

## Release process

1. Create a feature/fix branch from `main`.
2. Apply database migrations through Supabase migrations, never ad-hoc destructive SQL in production.
3. Update `CHANGELOG.md` and package version when the change constitutes a release.
4. Open a PR to `main`.
5. Require GitHub CI build success and Vercel preview success.
6. Test login, role restrictions, dashboard, income, expenses, reports, fleet, invoices, admin settings and PWA install on mobile.
7. Merge only after validation.
8. Confirm the production Vercel deployment succeeds.

## Versioning

Semantic Versioning is used:
- PATCH: fixes only.
- MINOR: backward-compatible features.
- MAJOR: breaking workflow/schema changes.

## Backup / recovery

- Supabase/PostgreSQL is the accounting source of truth.
- Historical spreadsheet references remain stored for reconciliation.
- Operational records should be archived instead of permanently deleted.
- Permanent deletion should be an exceptional administrator operation.
- Receipt, invoice and company-branding files are stored in controlled Supabase Storage buckets.

## Known security administration item

Supabase leaked-password protection should be enabled when the project plan supports it. The database advisor may also flag intentionally callable `SECURITY DEFINER` role/admin helper functions; these functions perform internal role checks and should be reviewed whenever authorization policies change.
