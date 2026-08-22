-- Administrative refinements: secure user access management and company branding storage.

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path=public
as $$
  select role from public.profiles where id = auth.uid() and active = true
$$;

revoke update on public.profiles from authenticated;
grant update(full_name, phone) on public.profiles to authenticated;

drop policy if exists profiles_manage on public.profiles;
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
for update to authenticated
using (id = auth.uid() and active = true)
with check (id = auth.uid());

create or replace function public.admin_update_user_profile(
  p_user_id uuid,
  p_full_name text,
  p_phone text,
  p_role text,
  p_active boolean
)
returns void
language plpgsql
security definer
set search_path=public
as $$
begin
  if public.current_role() <> 'admin' then
    raise exception 'Administrator permission required';
  end if;
  if p_role not in ('admin','operations','accounts','driver') then
    raise exception 'Invalid role';
  end if;
  if p_user_id = auth.uid() and p_active = false then
    raise exception 'You cannot deactivate your own administrator account';
  end if;
  update public.profiles
  set full_name = nullif(trim(p_full_name),''),
      phone = nullif(trim(p_phone),''),
      role = p_role,
      active = p_active,
      updated_at = now()
  where id = p_user_id;
end
$$;

revoke all on function public.admin_update_user_profile(uuid,text,text,text,boolean) from public, anon;
grant execute on function public.admin_update_user_profile(uuid,text,text,text,boolean) to authenticated;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('company-assets','company-assets',false,2097152,array['image/png','image/jpeg','image/webp','image/svg+xml'])
on conflict (id) do update set file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists company_assets_read on storage.objects;
drop policy if exists company_assets_admin_insert on storage.objects;
drop policy if exists company_assets_admin_update on storage.objects;
drop policy if exists company_assets_admin_delete on storage.objects;
create policy company_assets_read on storage.objects for select to authenticated using (bucket_id='company-assets');
create policy company_assets_admin_insert on storage.objects for insert to authenticated with check (bucket_id='company-assets' and public.current_role()='admin');
create policy company_assets_admin_update on storage.objects for update to authenticated using (bucket_id='company-assets' and public.current_role()='admin') with check (bucket_id='company-assets' and public.current_role()='admin');
create policy company_assets_admin_delete on storage.objects for delete to authenticated using (bucket_id='company-assets' and public.current_role()='admin');
