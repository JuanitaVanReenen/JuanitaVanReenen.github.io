-- CARELOOP department-aware owner assignment.
-- Apply after migrations 001–004, in order.
-- Draft only: not executed or independently security-tested.

create or replace function public.careloop_is_eligible_workflow_owner(
  target_hospital uuid,
  target_department uuid,
  target_user uuid
)
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
      and hm.user_id = target_user
      and (
        hm.role = 'hospital_admin'
        or (
          target_department is not null
          and hm.department_id = target_department
          and hm.role in ('department_manager', 'clinician', 'staff', 'viewer')
        )
      )
  );
$$;

revoke all on function public.careloop_is_eligible_workflow_owner(uuid, uuid, uuid) from public, anon;
grant execute on function public.careloop_is_eligible_workflow_owner(uuid, uuid, uuid) to authenticated;

drop policy if exists workflow_items_insert_member on public.workflow_items;
create policy workflow_items_insert_member on public.workflow_items
for insert to authenticated
with check (
  public.careloop_can_edit_workflow(hospital_id, department_id)
  and created_by = auth.uid()
  and (
    owner_user_id is null
    or public.careloop_is_eligible_workflow_owner(hospital_id, department_id, owner_user_id)
  )
);

drop policy if exists workflow_items_update_member on public.workflow_items;
create policy workflow_items_update_member on public.workflow_items
for update to authenticated
using (public.careloop_can_edit_workflow(hospital_id, department_id))
with check (
  public.careloop_can_edit_workflow(hospital_id, department_id)
  and (
    owner_user_id is null
    or public.careloop_is_eligible_workflow_owner(hospital_id, department_id, owner_user_id)
  )
);

-- A group administrator may create and oversee a workflow, but is not a
-- selectable operational owner unless separately assigned a hospital role.
-- Hospital administrators have hospital-wide owner eligibility.
-- Ordinary staff/clinicians/viewers are eligible only within their assigned
-- department. A NULL department does not grant broad eligibility.
-- Account activation/deactivation is not yet represented in the schema; add
-- that check through the trusted identity/provisioning layer before production.

-- Required tests:
-- 1. Department A clinician can assign an active Department A colleague.
-- 2. Department A clinician cannot assign a Department B colleague.
-- 3. Department A clinician cannot assign a hospital member with NULL department.
-- 4. Hospital admin can be assigned work in any department of that hospital.
-- 5. Group admin without hospital membership cannot be assigned operational work.
-- 6. A user from another hospital or organisation cannot be assigned.
-- 7. Viewer cannot create/update work even if eligible to receive assignment.
