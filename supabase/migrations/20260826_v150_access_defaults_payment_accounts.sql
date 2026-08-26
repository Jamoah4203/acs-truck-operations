-- v1.5.0 access/defaults migration. Applied to the production Supabase project on 2026-08-26.
-- Adds per-user dashboard/history controls, assigned/default trucks, configurable payment accounts,
-- history-aware RLS, dashboard enforcement, profile privilege-field guard and user-visible audit access.

alter table public.profiles add column if not exists can_view_dashboard boolean not null default true;
alter table public.profiles add column if not exists history_months integer null check (history_months is null or history_months >= 1);
alter table public.profiles add column if not exists default_vehicle_id uuid null references public.vehicles(id) on delete set null;
alter table public.vehicles add column if not exists is_default boolean not null default false;

create table if not exists public.payment_accounts(
 id uuid primary key default gen_random_uuid(), name text not null, code text not null unique,
 account_type text not null default 'cash' check (account_type in ('cash','momo','bank','other')),
 active boolean not null default true, is_default boolean not null default false, notes text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.transactions add column if not exists payment_account_id uuid null references public.payment_accounts(id) on delete set null;
create index if not exists idx_transactions_payment_account_id on public.transactions(payment_account_id);

-- See Supabase migration history for the live RLS/function definitions and seeded Cash/MoMo/Bank accounts.
