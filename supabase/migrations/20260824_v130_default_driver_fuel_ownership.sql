create or replace function public.default_driver_fuel_ownership()
returns trigger
language plpgsql
security invoker
set search_path=public
as $$
begin
  if exists(select 1 from public.profiles where id=auth.uid() and role='driver' and active) then
    new.driver_id:=auth.uid();
    new.created_by:=auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists fuel_default_driver_ownership on public.fuel_logs;
create trigger fuel_default_driver_ownership
before insert on public.fuel_logs
for each row execute function public.default_driver_fuel_ownership();
