-- CARELOOP follow-up security hardening migration.
-- Apply only after the initial schema has been reviewed in a disposable test database.
-- This is still a draft; it is not production certification.

-- Prevent a workflow record from being moved between hospitals or having its
-- creator identity rewritten after creation. These fields anchor tenant scope
-- and accountability history.
create or replace function public.careloop_guard_workflow_update()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if new.id is distinct from old.id then
    raise exception 'Workflow item identity cannot be changed';
  end if;

  if new.hospital_id is distinct from old.hospital_id then
    raise exception 'Workflow item cannot be moved between hospitals';
  end if;

  if new.created_by is distinct from old.created_by then
    raise exception 'Workflow creator cannot be changed';
  end if;

  return new;
end;
$$;

revoke all on function public.careloop_guard_workflow_update() from public, anon, authenticated;

drop trigger if exists workflow_items_guard_identity on public.workflow_items;
create trigger workflow_items_guard_identity
before update on public.workflow_items
for each row execute function public.careloop_guard_workflow_update();

-- Keep audit history useful for accountability while avoiding copies of free-text
-- fields that could accidentally contain patient names or clinical details.
-- Audit only structural/operational fields; never store title, summary or metadata.
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
    new_row := to_jsonb(new) - array['title', 'operational_summary', 'metadata'];
    item_id := new.id;
    hospital_id_value := new.hospital_id;
  elsif tg_op = 'UPDATE' then
    old_row := to_jsonb(old) - array['title', 'operational_summary', 'metadata'];
    new_row := to_jsonb(new) - array['title', 'operational_summary', 'metadata'];
    item_id := new.id;
    hospital_id_value := new.hospital_id;
  else
    old_row := to_jsonb(old) - array['title', 'operational_summary', 'metadata'];
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

revoke all on function public.careloop_write_audit_event() from public, anon, authenticated;

-- Explicitly prevent direct audit-history modification through normal API roles.
revoke insert, update, delete, truncate, references, trigger
on public.audit_events from anon, authenticated;

-- Trigger execution does not require application roles to have EXECUTE permission.
-- Recreate trigger to ensure it continues to point at the hardened function.
drop trigger if exists workflow_items_audit on public.workflow_items;
create trigger workflow_items_audit
after insert or update or delete on public.workflow_items
for each row execute function public.careloop_write_audit_event();

-- Required validation after applying this migration:
-- 1. Attempt hospital_id and created_by changes as an authenticated user; both must fail.
-- 2. Insert/update/delete a synthetic workflow row; audit rows should be created.
-- 3. Inspect audit before_data/after_data; title, operational_summary and metadata must be absent.
-- 4. Attempt direct audit_events INSERT/UPDATE/DELETE as anon and authenticated; all must fail.
-- 5. Confirm tenant isolation and role permissions with separate test users.
