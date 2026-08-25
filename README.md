# ACS Truck Operations

ACS Truck Operations is the operational and management PWA for Avenue Construction Supply GH Ltd truck activities.

## Current release

**v1.4.1**

## Core capabilities

- Dashboard and management-period analysis.
- Delivery, income, expense, fuel, maintenance and fleet registers.
- Profit & Loss and Balance Sheet reporting.
- Customer, vendor, category, company and user administration.
- Driver-oriented delivery progression.
- Selectable-column Excel exports.
- Branded invoice and management PDF generation.
- Installable PWA with update/recovery controls.
- Private, server-backed document storage for company branding, receipts, invoices, proof of delivery, photos and maintenance documents.

## Document storage

Company logos are stored in the private Supabase Storage bucket `company-assets`. Operational attachments are stored in the private `truck-documents` bucket and are linked to their business records through the `public.documents` table. Database and Storage RLS enforce cross-device access for authorized authenticated users. The browser/device that uploaded a file is never treated as the authoritative copy.

## Deployment

The frontend is Vite/React and can be deployed to Vercel or the included Docker/nginx production setup. Supabase provides Auth, PostgreSQL, Realtime and Storage.

See `PRODUCTION.md`, `CHANGELOG.md` and `MOBILE-FIRST.md` for production and release guidance.
