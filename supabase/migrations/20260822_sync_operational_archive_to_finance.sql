create or replace function public.sync_operational_archive_to_finance()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if tg_table_name='fuel_logs' and new.transaction_id is not null then
    update public.transactions set archived_at=new.archived_at, archived_by=new.archived_by, updated_at=now() where id=new.transaction_id;
  elsif tg_table_name='maintenance_records' and new.transaction_id is not null then
    update public.transactions set archived_at=new.archived_at, archived_by=new.archived_by, updated_at=now() where id=new.transaction_id;
  elsif tg_table_name='deliveries' then
    update public.transactions set archived_at=new.archived_at, archived_by=new.archived_by, updated_at=now() where external_reference='delivery:'||new.id::text;
  end if;
  return new;
end $$;

drop trigger if exists fuel_archive_finance_sync on public.fuel_logs;
create trigger fuel_archive_finance_sync after update of archived_at,archived_by on public.fuel_logs for each row execute function public.sync_operational_archive_to_finance();
drop trigger if exists maintenance_archive_finance_sync on public.maintenance_records;
create trigger maintenance_archive_finance_sync after update of archived_at,archived_by on public.maintenance_records for each row execute function public.sync_operational_archive_to_finance();
drop trigger if exists delivery_archive_finance_sync on public.deliveries;
create trigger delivery_archive_finance_sync after update of archived_at,archived_by on public.deliveries for each row execute function public.sync_operational_archive_to_finance();

revoke execute on function public.sync_operational_archive_to_finance() from public,anon,authenticated;
