-- CARELOOP membership visibility correction.
-- Apply after 001_initial_schema.sql and 002_security_hardening.sql in a disposable test DB.
-- This draft is not runtime-tested or production-approved.

-- RLS on hospital_memberships intentionally hides ordinary colleagues from one another.
-- A policy that directly queries that table to validate an assigned owner can therefore
-- reject legitimate assignments. This narrowly scoped SECURITY DEFINER helper performs
-- only the membership existence check needed by workflow owner validation.
create or replace function public.careloop_is_hospital_member(
  target_hospital uuid,
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
  );
$$;

revoke all on function public.careloop_is_hospital_member(uuid, uuid) from public, anon;
grant execute on function public.careloop_is_hospital_member(uuid, uuid) to authenticated;

drop policy if exists workflow_items_insert_member on public.workflow_items;
create policy workflow_items_insert_member on public.workflow_items
for insert to authenticated
with check (
  public.careloop_can_edit_hospital(hospital_id)
  and created_by = auth.uid()
  and (
    owner_user_id is null
    or public.careloop_is_hospital_member(hospital_id, owner_user_id)
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
    or public.careloop_is_hospital_member(hospital_id, owner_user_id)
  )
);

-- Membership, organization, hospital, department and profile provisioning are
-- intentionally not exposed as ordinary client-side write policies here.
-- A future trusted administrative provisioning service must validate the actor,
-- enforce role-assignment boundaries, and write an audit trail before enabling
-- hospital onboarding. Never place a service-role secret in browser code.

-- Validation cases for a disposable database:
-- A. A clinician can assign an owner who is a member of the same hospital.
-- B. A clinician cannot assign a user who is not a member of that hospital.
-- C. A clinician cannot assign a member of a different hospital.
-- D. A viewer cannot create or update workflow items.
-- E. A group admin can assign a member of a hospital in their organization.
-- F. Hospital membership rows remain hidden from ordinary staff unless permitted.
