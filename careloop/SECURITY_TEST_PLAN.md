# CARELOOP database security test plan

**Status:** Pre-production checklist. These are planned tests, not completed test results.

Do not connect real patient data or describe this schema as production-ready until the applicable tests have been run in an isolated environment, independently reviewed, and signed off.

## Test setup
- Use a disposable database with synthetic users, organizations, hospitals, departments and workflow records.
- Create two unrelated organizations, at least two hospitals in one organization, and one hospital in the other.
- Create group administrators, hospital administrators, department managers, clinicians, staff and viewers.
- Use fictional data only.

## Tenant and hospital isolation
- [ ] Members of one organization cannot read another organization's records.
- [ ] Hospital-only members cannot read other hospitals without explicit membership.
- [ ] Group administrators are limited to their own organization.
- [ ] Removing a membership removes access on the next request.
- [ ] Cross-hospital department IDs are rejected.

## Role permissions and ownership
- [ ] Viewers cannot insert, update or delete workflow records through the API.
- [ ] Clinicians and staff can edit only in hospitals where they are members.
- [ ] A creator cannot impersonate another user in created_by.
- [ ] An assigned owner must be a member of the same hospital.
- [ ] Users cannot move records across hospitals by changing hospital_id.
- [ ] Only approved managers can delete workflow records.

## Audit integrity
- [ ] Inserts, updates and deletes create correct audit events.
- [ ] Application users cannot directly insert, update or delete audit rows.
- [ ] Application users cannot execute trigger functions directly.
- [ ] Audit records cannot be silently altered or removed by application roles.
- [ ] Authenticated actor identity is recorded correctly; service-role actions are separately controlled.
- [ ] Audit payloads contain no patient-identifiable or unnecessary sensitive data.
- [ ] Retention, export, backup and access rules are tested.

## Workflow integrity
- [ ] Only handover, follow-up and transition workflow types are accepted.
- [ ] Invalid status, priority and transition values are rejected.
- [ ] Acknowledgement and completion timestamps follow approved lifecycle rules.
- [ ] Overdue/escalation behaviour runs server-side, not only in the browser.
- [ ] Concurrent updates do not silently overwrite staff changes.
- [ ] User deactivation does not erase accountability history unexpectedly.

## Platform controls
- [ ] RLS is enabled and tested on every exposed table for every role.
- [ ] Function ownership, SECURITY DEFINER, search_path, grants and default privileges receive specialist review.
- [ ] Anonymous access and unintended public grants are absent.
- [ ] Encryption, key management, backups, restore drills and incident response are verified.
- [ ] Hosting region, cross-border transfers and applicable privacy obligations are reviewed.
- [ ] Clinical boundaries are explicit: CARELOOP tracks operational work; it does not diagnose, prescribe, interpret results or authorize clinical decisions.

## Release gate
No live integration or patient data until tests pass, failures are fixed and retested, and qualified security, privacy, legal and clinical reviewers approve the intended deployment.

## Department-scope tests (migration 004)
- [ ] Department A clinician can create and update records only in department A.
- [ ] Department A clinician cannot update or delete records in department B.
- [ ] Department A manager cannot view membership rows from department B.
- [ ] Hospital administrators retain hospital-wide workflow and membership visibility.
- [ ] Group administrators remain limited to hospitals in their own organization.
- [ ] A non-admin with a NULL department assignment receives no implicit department-wide edit access.
- [ ] Owner assignment accepts only an authorised member of the same hospital; test department eligibility separately before production.

## Provisioning gate
- [ ] No browser-side role or membership writes are enabled until a trusted provisioning flow exists.
- [ ] Provisioning prevents self-promotion, cross-organization assignment and unauthorised role changes.
- [ ] Invitation, deactivation, removal and recovery flows are tested and audited.
