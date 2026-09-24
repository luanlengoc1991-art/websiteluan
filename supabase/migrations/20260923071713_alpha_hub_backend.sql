-- Dedicated Alpha Hub tables; existing CRM tables remain untouched.
create table public.alpha_records (
  owner uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  id text not null,
  payload text not null,
  updated bigint not null,
  primary key (owner, kind, id)
);
create table public.alpha_reservations (
  id uuid primary key,
  owner uuid not null references auth.users(id) on delete cascade,
  unit_id text not null,
  customer_id text not null,
  note text not null,
  status text not null,
  expires_at bigint not null,
  created_at bigint not null
);
create index alpha_reservations_owner_created on public.alpha_reservations(owner, created_at desc);
create unique index alpha_reservations_active_unit on public.alpha_reservations(owner, unit_id)
  where status in ('Đang giữ chỗ', 'Đã bán');
create table public.alpha_files (
  id uuid primary key,
  owner uuid not null references auth.users(id) on delete cascade,
  project_id text not null,
  kind text not null,
  name text not null,
  mime text not null,
  object_key text not null
);
create index alpha_files_owner on public.alpha_files(owner);

alter table public.alpha_records enable row level security;
alter table public.alpha_reservations enable row level security;
alter table public.alpha_files enable row level security;
grant select, insert, update, delete on public.alpha_records, public.alpha_reservations, public.alpha_files to authenticated;

create policy alpha_records_owner_select on public.alpha_records for select to authenticated using ((select auth.uid()) = owner);
create policy alpha_records_owner_insert on public.alpha_records for insert to authenticated with check ((select auth.uid()) = owner);
create policy alpha_records_owner_update on public.alpha_records for update to authenticated using ((select auth.uid()) = owner) with check ((select auth.uid()) = owner);
create policy alpha_records_owner_delete on public.alpha_records for delete to authenticated using ((select auth.uid()) = owner);
create policy alpha_reservations_owner_select on public.alpha_reservations for select to authenticated using ((select auth.uid()) = owner);
create policy alpha_reservations_owner_insert on public.alpha_reservations for insert to authenticated with check ((select auth.uid()) = owner);
create policy alpha_reservations_owner_update on public.alpha_reservations for update to authenticated using ((select auth.uid()) = owner) with check ((select auth.uid()) = owner);
create policy alpha_files_owner_select on public.alpha_files for select to authenticated using ((select auth.uid()) = owner);
create policy alpha_files_owner_insert on public.alpha_files for insert to authenticated with check ((select auth.uid()) = owner);
create policy alpha_files_owner_delete on public.alpha_files for delete to authenticated using ((select auth.uid()) = owner);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('alpha-hub-files', 'alpha-hub-files', false, 15728640, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;
create policy alpha_storage_read on storage.objects for select to authenticated
  using (bucket_id = 'alpha-hub-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy alpha_storage_write on storage.objects for insert to authenticated
  with check (bucket_id = 'alpha-hub-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy alpha_storage_delete on storage.objects for delete to authenticated
  using (bucket_id = 'alpha-hub-files' and (storage.foldername(name))[1] = (select auth.uid())::text);

create function public.alpha_reserve(
  p_id uuid, p_unit_id text, p_customer_id text, p_note text, p_expires_at bigint, p_created_at bigint
) returns boolean language plpgsql security invoker set search_path = '' as $$
declare v_owner uuid := (select auth.uid());
begin
  if v_owner is null then return false; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(v_owner::text || ':' || p_unit_id));
  update public.alpha_reservations set status = 'Hết hạn'
    where owner = v_owner and unit_id = p_unit_id and status = 'Đang giữ chỗ' and expires_at <= p_created_at;
  if exists (select 1 from public.alpha_reservations
       where owner = v_owner and unit_id = p_unit_id and status in ('Đang giữ chỗ','Đã bán'))
    or exists (select 1 from public.alpha_records
       where owner = v_owner and kind = 'unit' and id = p_unit_id and payload::jsonb ->> 'status' = 'Đã bán')
    or not exists (select 1 from public.alpha_records
       where owner = v_owner and kind = 'customer' and id = p_customer_id) then return false;
  end if;
  insert into public.alpha_reservations(id,owner,unit_id,customer_id,note,status,expires_at,created_at)
  values (p_id,v_owner,p_unit_id,p_customer_id,p_note,'Đang giữ chỗ',p_expires_at,p_created_at);
  return true;
exception when unique_violation then return false;
end; $$;
revoke all on function public.alpha_reserve(uuid,text,text,text,bigint,bigint) from public, anon;
grant execute on function public.alpha_reserve(uuid,text,text,text,bigint,bigint) to authenticated;
