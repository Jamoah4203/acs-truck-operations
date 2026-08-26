create or replace function public.normalize_delivery_source_type()
returns trigger
language plpgsql
set search_path=public
as $$
begin
  new.source_type := case lower(trim(coalesce(new.source_type,'acs')))
    when 'acs delivery' then 'acs'
    when 'acs' then 'acs'
    when 'internal' then 'acs'
    when 'internal delivery' then 'acs'
    when 'external delivery' then 'external'
    when 'external' then 'external'
    when 'third party' then 'external'
    when 'third-party' then 'external'
    when 'other delivery' then 'other'
    when 'other' then 'other'
    else lower(trim(coalesce(new.source_type,'acs')))
  end;
  if new.payment_status = 'partial' then new.payment_status := 'part_paid'; end if;
  return new;
end $$;

drop trigger if exists normalize_delivery_source_type_trigger on public.deliveries;
create trigger normalize_delivery_source_type_trigger
before insert or update of source_type,payment_status on public.deliveries
for each row execute function public.normalize_delivery_source_type();

create or replace function public.normalize_transaction_payment_status()
returns trigger
language plpgsql
set search_path=public
as $$
begin
  if new.payment_status = 'partial' then new.payment_status := 'part_paid'; end if;
  return new;
end $$;

drop trigger if exists normalize_transaction_payment_status_trigger on public.transactions;
create trigger normalize_transaction_payment_status_trigger
before insert or update of payment_status on public.transactions
for each row execute function public.normalize_transaction_payment_status();
