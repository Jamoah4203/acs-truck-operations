alter table public.documents
  add column if not exists document_kind text not null default 'other',
  add column if not exists description text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.documents drop constraint if exists documents_document_kind_check;
alter table public.documents add constraint documents_document_kind_check
  check (document_kind in ('receipt','invoice','proof_of_delivery','photo','maintenance_document','other'));

create unique index if not exists documents_bucket_path_uidx on public.documents(bucket,path);
create index if not exists documents_entity_idx on public.documents(entity_type,entity_id,created_at desc);
create index if not exists documents_uploaded_by_idx on public.documents(uploaded_by);

create or replace function public.can_access_document(p_entity_type text,p_entity_id uuid)
returns boolean language plpgsql stable security definer set search_path=public as $$
declare r text; u uuid;
begin
  u:=auth.uid(); if u is null then return false; end if;
  r:=public.current_role(); if r in ('admin','operations','accounts') then return true; end if;
  if r<>'driver' then return false; end if;
  if p_entity_type='delivery' then return exists(select 1 from public.deliveries d where d.id=p_entity_id and d.driver_id=u);
  elsif p_entity_type='fuel' then return exists(select 1 from public.fuel_logs f left join public.deliveries d on d.id=f.delivery_id where f.id=p_entity_id and (f.driver_id=u or d.driver_id=u));
  elsif p_entity_type='transaction' then return exists(select 1 from public.transactions t left join public.deliveries d on d.id=t.delivery_id where t.id=p_entity_id and (t.driver_id=u or d.driver_id=u));
  elsif p_entity_type='maintenance' then return false;
  end if;
  return false;
end $$;
revoke execute on function public.can_access_document(text,uuid) from public,anon;
grant execute on function public.can_access_document(text,uuid) to authenticated;

drop policy if exists documents_read on public.documents;
create policy documents_read on public.documents for select to authenticated
using (public.can_access_document(entity_type,entity_id) or uploaded_by=(select auth.uid()));

drop policy if exists truck_docs_select on storage.objects;
create policy truck_docs_select on storage.objects for select to authenticated
using (bucket_id='truck-documents' and exists (select 1 from public.documents d where d.bucket=storage.objects.bucket_id and d.path=storage.objects.name and (public.can_access_document(d.entity_type,d.entity_id) or d.uploaded_by=(select auth.uid()))));

create or replace function public.classify_document_kind()
returns trigger language plpgsql set search_path=public as $$
begin
  if new.document_kind is null or new.document_kind='other' then
    new.document_kind:=case new.entity_type when 'fuel' then 'receipt' when 'maintenance' then 'maintenance_document' when 'delivery' then 'proof_of_delivery' when 'transaction' then 'receipt' else coalesce(new.document_kind,'other') end;
  end if;
  return new;
end $$;
drop trigger if exists documents_classify_kind on public.documents;
create trigger documents_classify_kind before insert on public.documents for each row execute function public.classify_document_kind();

create or replace function public.set_document_updated_at()
returns trigger language plpgsql set search_path=public as $$ begin new.updated_at=now(); return new; end $$;
drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at before update on public.documents for each row execute function public.set_document_updated_at();

update public.documents set document_kind=case entity_type when 'fuel' then 'receipt' when 'maintenance' then 'maintenance_document' when 'delivery' then 'proof_of_delivery' when 'transaction' then 'receipt' else 'other' end where document_kind='other';
