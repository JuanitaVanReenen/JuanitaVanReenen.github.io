-- CARELOOP department-scoped workflow permissions.
-- Apply after 001_initial_schema.sql, 002_security_hardening.sql and
-- 003_membership_policy_correction.sql, in that order.
-- Draft only: not executed, tested against a database, or production-approved.

-- Group admins can work across their organization. Hospital admins can work
-- across their hospital. Department managers, clinicians and staff are limited
-- to the department recorded on their hospital membership. A NULL department
-- does not silently grant hospital-wide access to non-admin roles.
create or replace function public.careloop_can_edit_workflow(
  target_hospital uuid,
  target_department uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select
    exists (
      select 1
      from public.hospitals h
      join public.organization_memberships om
        on om.organization_id = h.organization_id
      where h.id = target_hospital
        and om.user_id = auth.uid()
        and om.role = 'group_admin'
    )
    or exists (
      select 1
      from public.hospital_memberships hm
      where hm.hospital_id = target_hospital
        and hm.user_id = auth.uid()
        and (
          hm.role = 'hospital_admin'
          or (
            hm.role in ('department_manager', 'clinician', 'staff')
            and target_department is not null
            and hm.department_id = target_department
          )
        )
    );
$$;

-- Department managers may view/manage memberships only in their own
-- department. Hospital admins and group admins retain their wider scope.
create or replace function public.careloop_can_manage_membership(
  target_hospital uuid,
  target_department uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select
    exists (
      select 1
      from public.hospitals h
      join public.organization_memberships om
        on om.organization_id = h.organization_id
      where h.id = target_hospital
        and om.user_id = auth.uid()
        and om.role = 'group_admin'
    )
    or exists (
      select 1
      from public.hospital_memberships hm
      where hm.hospital_id = target_hospital
        and hm.user_id = auth.uid()
        and (
          hm.role = 'hospital_admin'
          or (
            hm.role = 'department_manager'
            and target_department is not null
            and hm.department_id = target_department
          )
        )
    );
$$;

revoke all on function public.careloop_can_edit_workflow(uuid, uuid) from public, anon;
revoke all on function public.careloop_can_manage_membership(uuid, uuid) from public, anon;
grant execute on function public.careloop_can_edit_workflow(uuid, uuid) to authenticated;
grant execute on function public.careloop_can_manage_membership(uuid, uuid) to authenticated;

drop policy if exists workflow_items_insert_member on public.workflow_items;
create policy workflow_items_insert_member on public.workflow_items
for insert to authenticated
with check (
  public.careloop_can_edit_workflow(hospital_id, department_id)
  and created_by = auth.uid()
  and (
    owner_user_id is null
    or public.careloop_is_hospital_member(hospital_id, owner_user_id)
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
    or public.careloop_is_hospital_member(hospital_id, owner_user_id)
  )
);

drop policy if exists workflow_items_delete_manager on public.workflow_items;
create policy workflow_items_delete_manager on public.workflow_items
for delete to authenticated
using (public.careloop_can_edit_workflow(hospital_id, department_id));

drop policy if exists hospital_memberships_read_scope on public.hospital_memberships;
create policy hospital_memberships_read_scope on public.hospital_memberships
for select to authenticated
using (
  user_id = auth.uid()
  or public.careloop_can_manage_membership(hospital_id, department_id)
);

-- No membership write policies are added here. Adding/removing users or changing
-- roles requires a separately designed trusted provisioning path, with
-- safeguards against self-promotion and cross-organization role escalation.

-- Required disposable-database tests:
-- 1. Department A clinician can create/update a workflow item in A.
-- 2. The same clinician cannot create/update/delete an item in department B.
-- 3. A department manager in A cannot view membership rows from department B.
-- 4. A hospital admin can manage workflow items and view memberships hospital-wide.
-- 5. A group admin can manage workflow items across hospitals in their organization.
-- 6. A viewer cannot create, update or delete workflow items.
-- 7. Users with NULL department_id do not receive implicit department-wide edit rights.
-- 8. Cross-hospital and cross-organization access remains denied.
