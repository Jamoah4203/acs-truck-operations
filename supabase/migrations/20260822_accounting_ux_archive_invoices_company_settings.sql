-- Applied to acs-truck Supabase on 2026-08-22.
-- Adds archive-first record lifecycle, invoice records, and company settings.

alter table public.transactions add column if not exists archived_at timestamptz, add column if not exists archived_by uuid references public.profiles(id) on delete set null;
alter table public.deliveries add column if not exists archived_at timestamptz, add column if not exists archived_by uuid references public.profiles(id) on delete set null;
alter table public.fuel_logs add column if not exists archived_at timestamptz, add column if not exists archived_by uuid references public.profiles(id) on delete set null;
alter table public.maintenance_records add column if not exists archived_at timestamptz, add column if not exists archived_by uuid references public.profiles(id) on delete set null;
alter table public.vehicles add column if not exists archived_at timestamptz, add column if not exists archived_by uuid references public.profiles(id) on delete set null;

create table if not exists public.invoices (
 id uuid primary key default gen_random_uuid(), invoice_number text not null unique,
 delivery_id uuid references public.deliveries(id) on delete set null,
 customer_id uuid references public.customers(id) on delete set null,
 issue_date date not null default current_date, due_date date,
 status text not null default 'draft' check(status in ('draft','issued','paid','cancelled')),
 subtotal numeric not null default 0 check(subtotal>=0), tax_amount numeric not null default 0 check(tax_amount>=0),
 total_amount numeric generated always as (subtotal+tax_amount) stored,
 notes text, created_by uuid references public.profiles(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- Company details live in app_settings key='company'.
-- Financial reporting views were updated in production to exclude archived records.
