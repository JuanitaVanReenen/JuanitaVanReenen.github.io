-- CARELOOP initial multi-tenant data model
-- PostgreSQL / Supabase migration draft.
-- Apply only after reviewing security, privacy, hosting region and production requirements.
-- Never use real patient-identifiable information in the prototype.

create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 160),
  created_at timestamptz not null default now()
);

create table if not exists public.hospitals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  name text not null check (length(trim(name)) between 1 and 160),
  timezone text not null default 'Africa/Windhoek',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, name),
  unique (id, organization_id)
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id) on delete restrict,
  name text not null check (length(trim(name)) between 1 and 120),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (hospital_id, name),
  unique (id, hospital_id)
);

-- Profile data is deliberately minimal. Authentication credentials stay in auth.users.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (length(trim(display_name)) between 1 and 120),
  created_at timestamptz not null default now()
);

create table if not exists public.organization_memberships (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('group_admin', 'group_viewer')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists public.hospital_memberships (
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('hospital_admin', 'department_manager', 'clinician', 'staff', 'viewer')),
  department_id uuid,
  created_at timestamptz not null default now(),
  primary key (hospital_id, user_id),
  constraint department_belongs_to_hospital
    foreign key (department_id, hospital_id)
    references public.departments(id, hospital_id)
    on delete restrict
);

create table if not exists public.workflow_items (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id) on delete restrict,
  department_id uuid,
  workflow_type text not null check (workflow_type in ('handover', 'followup', 'transition')),
  title text not null check (length(trim(title)) between 1 and 180),
  operational_summary text not null default '' check (length(operational_summary) <= 2000),
  status text not null default 'open'
    check (status in ('open', 'awaiting_acknowledgement', 'acknowledged', 'in_progress', 'overdue', 'completed', 'cancelled')),
  priority text not null default 'routine' check (priority in ('routine', 'important', 'urgent')),
  owner_user_id uuid references auth.users(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete restrict,
  due_at timestamptz,
  acknowledged_at timestamptz,
  completed_at timestamptz,
  handover_from_shift text,
  handover_to_shift text,
  transition_kind text check (transition_kind in ('admission', 'discharge')),
  outstanding_steps integer check (outstanding_steps is null or outstanding_steps between 0 and 100),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint department_matches_hospital
    foreign key (department_id, hospital_id)
    references public.departments(id, hospital_id)
);

create index if not exists workflow_items_hospital_status_due_idx
  on public.workflow_items (hospital_id, status, due_at);
create index if not exists workflow_items_owner_status_idx
  on public.workflow_items (owner_user_id, status);
create index if not exists workflow_items_hospital_type_created_idx
  on public.workflow_items (hospital_id, workflow_type, created_at desc);
create index if not exists hospital_memberships_user_idx
  on public.hospital_memberships (user_id, hospital_id);

create table if not exists public.audit_events (
  id bigint generated always as identity primary key,
  hospital_id uuid not null references public.hospitals(id) on delete restrict,
  workflow_item_id uuid,
  actor_user_id uuid,
  event_type text not null,
  before_data jsonb,
  after_data jsonb,
  occurred_at timestamptz not null default now()
);
create index if not exists audit_events_hospital_time_idx
  on public.audit_events (hospital_id, occurred_at desc);
create index if not exists audit_events_item_time_idx
  on public.audit_events (workflow_item_id, occurred_at desc);

create or replace function public.careloop_can_access_hospital(target_hospital uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.hospital_memberships hm
    where hm.hospital_id = target_hospital
      and hm.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.hospitals h
    join public.organization_memberships om
      on om.organization_id = h.organization_id
    where h.id = target_hospital
      and om.user_id = auth.uid()
  );
$$;

create or replace function public.careloop_can_access_organization(target_organization uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.organization_memberships om
    where om.organization_id = target_organization and om.user_id = auth.uid()
  )
  or exists (
    select 1 from public.hospitals h
    join public.hospital_memberships hm on hm.hospital_id = h.id
    where h.organization_id = target_organization and hm.user_id = auth.uid()
  );
$$;

create or replace function public.careloop_is_group_admin(target_organization uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.organization_memberships om
    where om.organization_id = target_organization
      and om.user_id = auth.uid()
      and om.role = 'group_admin'
  );
$$;

create or replace function public.careloop_can_edit_hospital(target_hospital uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.hospital_memberships hm
    where hm.hospital_id = target_hospital
      and hm.user_id = auth.uid()
      and hm.role in ('hospital_admin', 'department_manager', 'clinician', 'staff')
  )
  or exists (
    select 1
    from public.hospitals h
    join public.organization_memberships om
      on om.organization_id = h.organization_id
    where h.id = target_hospital
      and om.user_id = auth.uid()
      and om.role = 'group_admin'
  );
$$;

create or replace function public.careloop_can_manage_hospital(target_hospital uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.hospital_memberships hm
    where hm.hospital_id = target_hospital
      and hm.user_id = auth.uid()
      and hm.role in ('hospital_admin', 'department_manager')
  )
  or exists (
    select 1
    from public.hospitals h
    join public.organization_memberships om
      on om.organization_id = h.organization_id
    where h.id = target_hospital
      and om.user_id = auth.uid()
      and om.role = 'group_admin'
  );
$$;

create or replace function public.careloop_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists workflow_items_updated_at on public.workflow_items;
create trigger workflow_items_updated_at
before update on public.workflow_items
for each row execute function public.careloop_set_updated_at();

create or replace function public.careloop_write_audit_event()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  old_row jsonb;
  new_row jsonb;
  item_id uuid;
  hospital_id_value uuid;
begin
  if tg_op = 'INSERT' then
    new_row := to_jsonb(new);
    item_id := new.id;
    hospital_id_value := new.hospital_id;
  elsif tg_op = 'UPDATE' then
    old_row := to_jsonb(old);
    new_row := to_jsonb(new);
    item_id := new.id;
    hospital_id_value := new.hospital_id;
  else
    old_row := to_jsonb(old);
    item_id := old.id;
    hospital_id_value := old.hospital_id;
  end if;

  insert into public.audit_events (
    hospital_id, workflow_item_id, actor_user_id, event_type, before_data, after_data
  ) values (
    hospital_id_value, item_id, auth.uid(), lower(tg_op), old_row, new_row
  );

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists workflow_items_audit on public.workflow_items;
create trigger workflow_items_audit
after insert or update or delete on public.workflow_items
for each row execute function public.careloop_write_audit_event();

alter table public.organizations enable row level security;
alter table public.hospitals enable row level security;
alter table public.departments enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.hospital_memberships enable row level security;
alter table public.workflow_items enable row level security;
alter table public.audit_events enable row level security;

drop policy if exists organizations_read_member on public.organizations;
create policy organizations_read_member on public.organizations
for select to authenticated
using (public.careloop_can_access_organization(id));

drop policy if exists hospitals_read_member on public.hospitals;
create policy hospitals_read_member on public.hospitals
for select to authenticated
using (public.careloop_can_access_hospital(id));

drop policy if exists departments_read_member on public.departments;
create policy departments_read_member on public.departments
for select to authenticated
using (public.careloop_can_access_hospital(hospital_id));

drop policy if exists profiles_read_same_hospital on public.profiles;
create policy profiles_read_self on public.profiles
for select to authenticated
using (user_id = auth.uid());

drop policy if exists organization_memberships_read_scope on public.organization_memberships;
create policy organization_memberships_read_scope on public.organization_memberships
for select to authenticated
using (
  user_id = auth.uid()
  or public.careloop_is_group_admin(organization_id)
);

drop policy if exists hospital_memberships_read_scope on public.hospital_memberships;
create policy hospital_memberships_read_scope on public.hospital_memberships
for select to authenticated
using (
  user_id = auth.uid()
  or public.careloop_can_manage_hospital(hospital_id)
);

drop policy if exists workflow_items_read_member on public.workflow_items;
create policy workflow_items_read_member on public.workflow_items
for select to authenticated
using (public.careloop_can_access_hospital(hospital_id));

drop policy if exists workflow_items_insert_member on public.workflow_items;
create policy workflow_items_insert_member on public.workflow_items
for insert to authenticated
with check (
  public.careloop_can_edit_hospital(hospital_id)
  and created_by = auth.uid()
  and (
    owner_user_id is null
    or exists (
      select 1 from public.hospital_memberships owner_membership
      where owner_membership.hospital_id = workflow_items.hospital_id
        and owner_membership.user_id = workflow_items.owner_user_id
    )
  )
);

drop policy if exists workflow_items_update_member on public.workflow_items;
create policy workflow_items_update_member on public.workflow_items
for update to authenticated
using (public.careloop_can_edit_hospital(hospital_id))
with check (
  public.careloop_can_edit_hospital(hospital_id)
  and (
    owner_user_id is null
    or exists (
      select 1 from public.hospital_memberships owner_membership
      where owner_membership.hospital_id = workflow_items.hospital_id
        and owner_membership.user_id = workflow_items.owner_user_id
    )
  )
);

drop policy if exists workflow_items_delete_manager on public.workflow_items;
create policy workflow_items_delete_manager on public.workflow_items
for delete to authenticated
using (public.careloop_can_manage_hospital(hospital_id));

drop policy if exists audit_events_read_member on public.audit_events;
create policy audit_events_read_member on public.audit_events
for select to authenticated
using (public.careloop_can_access_hospital(hospital_id));

-- Workflow creation/editing is limited to non-viewer hospital roles or group admins.
-- Assigned owners must be members of the same hospital.
-- Explicit API privileges: row-level security policies still constrain each row.
grant usage on schema public to authenticated;
grant select on public.organizations, public.hospitals, public.departments,
  public.profiles, public.organization_memberships, public.hospital_memberships,
  public.workflow_items, public.audit_events to authenticated;
grant insert, update, delete on public.workflow_items to authenticated;
revoke all on function public.careloop_can_access_hospital(uuid) from public, anon;
revoke all on function public.careloop_can_access_organization(uuid) from public, anon;
revoke all on function public.careloop_is_group_admin(uuid) from public, anon;
revoke all on function public.careloop_can_edit_hospital(uuid) from public, anon;
revoke all on function public.careloop_can_manage_hospital(uuid) from public, anon;
revoke all on function public.careloop_set_updated_at() from public, anon, authenticated;
revoke all on function public.careloop_write_audit_event() from public, anon, authenticated;

grant execute on function public.careloop_can_access_hospital(uuid) to authenticated;
grant execute on function public.careloop_can_access_organization(uuid) to authenticated;
grant execute on function public.careloop_is_group_admin(uuid) to authenticated;
grant execute on function public.careloop_can_manage_hospital(uuid) to authenticated;
grant execute on function public.careloop_can_edit_hospital(uuid) to authenticated;

-- No direct INSERT/UPDATE/DELETE policy is intentionally granted on audit_events.
-- The trigger writes audit rows so application users cannot rewrite history.
