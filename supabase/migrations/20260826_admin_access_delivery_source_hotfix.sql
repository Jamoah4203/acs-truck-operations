create or replace function public.admin_update_user_access(
  p_user_id uuid,
  p_role text,
  p_active boolean,
  p_can_view_dashboard boolean,
  p_history_months integer,
  p_default_vehicle_id uuid
) returns void
language plpgsql
security definer
set search_path=public
as $$
begin
  if public.current_role() <> 'admin' then
    raise exception 'Only administrators can change user access.' using errcode='42501';
  end if;
  if p_role not in ('admin','operations','accounts','driver') then
    raise exception 'Invalid role.' using errcode='22023';
  end if;
  if p_history_months is not null and p_history_months < 1 then
    raise exception 'History access must be at least one month.' using errcode='22023';
  end if;
  if p_user_id = auth.uid() and p_active = false then
    raise exception 'You cannot deactivate your own account.' using errcode='22023';
  end if;
  update public.profiles
     set role=p_role,
         active=p_active,
         can_view_dashboard=coalesce(p_can_view_dashboard,true),
         history_months=p_history_months,
         default_vehicle_id=p_default_vehicle_id,
         updated_at=now()
   where id=p_user_id;
  if not found then raise exception 'User profile was not found.' using errcode='P0002'; end if;
  insert into public.audit_logs(actor_id,table_name,record_id,action,new_data)
  values(auth.uid(),'profiles',p_user_id::text,'ACCESS_UPDATED',jsonb_build_object('role',p_role,'active',p_active,'can_view_dashboard',p_can_view_dashboard,'history_months',p_history_months,'default_vehicle_id',p_default_vehicle_id));
end $$;
revoke all on function public.admin_update_user_access(uuid,text,boolean,boolean,integer,uuid) from public,anon;
grant execute on function public.admin_update_user_access(uuid,text,boolean,boolean,integer,uuid) to authenticated;

create or replace function public.normalize_delivery_source_type()
returns trigger language plpgsql set search_path=public as $$
begin
  new.source_type := case lower(trim(coalesce(new.source_type,'acs')))
    when 'acs delivery' then 'acs'
    when 'acs' then 'acs'
    when 'external delivery' then 'external'
    when 'external' then 'external'
    when 'other' then 'other'
    else new.source_type
  end;
  return new;
end $$;
drop trigger if exists normalize_delivery_source_type_trigger on public.deliveries;
create trigger normalize_delivery_source_type_trigger before insert or update of source_type on public.deliveries for each row execute function public.normalize_delivery_source_type();

drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles for update to authenticated
using (public.current_role()='admin')
with check (public.current_role()='admin');
