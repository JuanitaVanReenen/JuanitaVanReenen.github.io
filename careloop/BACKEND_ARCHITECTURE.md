# CARELOOP backend and integration architecture

**Document status:** Architecture proposal for review. This is not an implemented backend, a security certification, or an approval to process patient information.

## 1. Purpose and boundaries

CARELOOP is one operational accountability platform with three connected workflow types:

- **Handover:** shift-to-shift transfer of outstanding operational actions.
- **Follow-up:** assigned work that must be reviewed, completed or escalated.
- **Transition:** admission and discharge coordination tasks and outstanding steps.

The common record model allows one dashboard, ownership model, audit history and escalation framework across all three workflows. CARELOOP complements existing clinical and hospital systems; it does not replace the legal medical record and does not make clinical decisions.

## 2. Recommended logical architecture

1. **Responsive web client** — staff workspace, department queue, hospital dashboard and group overview. The browser is an untrusted client.
2. **Identity provider** — managed authentication with MFA support, secure session handling, account deactivation and recovery.
3. **Application/API layer** — validates inputs, role and department scope, workflow lifecycle transitions, owner eligibility and idempotency. No service-role secret is shipped to the browser.
4. **Relational database** — organisation, hospital, department, membership, workflow and audit records. Tenant boundaries enforced server-side with row-level security as defence in depth.
5. **Background worker** — due-time evaluation, reminders and escalation delivery. It must be idempotent and record delivery outcomes.
6. **Integration adapter** — future, separately authorised connectors to hospital systems. Start with documented import/export contracts and synthetic data; no live integration in the prototype.
7. **Observability and operations** — security logs, application metrics, backup/restore, incident handling and access review.

The browser must never be trusted to enforce tenant isolation, permissions, due dates or audit integrity.

## 3. Tenant and role model

Hierarchy:

`Organisation → Hospital → Department → Workflow item`

A hospital can operate independently as a one-hospital organisation. A group organisation can contain multiple hospitals.

Proposed role boundaries:

| Role | Read scope | Write scope |
|---|---|---|
| Group administrator | Hospitals in own organisation | Organisation-wide operational administration |
| Group viewer | Hospitals in own organisation | Read only |
| Hospital administrator | Their hospital | Hospital-wide workflow administration |
| Department manager | Assigned department | Assigned department workflows and scoped team administration |
| Clinician / staff | Assigned department | Permitted operational actions in assigned department |
| Viewer | Explicitly assigned scope | Read only |

A missing department assignment must not silently grant department-wide write access. Cross-hospital and cross-organisation access is denied by default.

Membership creation, invitation, role changes, suspension and removal must use a trusted administrative service. They are not ordinary browser-side writes. The service must prevent self-promotion and unauthorised cross-tenant role assignment.

## 4. Shared workflow record

The shared workflow item should include:

- Stable item identifier and tenant/hospital/department identifiers.
- Workflow type: `handover`, `followup` or `transition`.
- Short operational title and minimum-necessary operational description.
- Creator, current owner and optional accepting/acknowledging user.
- Priority, due time, lifecycle status and timestamps.
- Type-specific structured fields.
- Version number for optimistic concurrency.
- Creation/update timestamps and immutable audit events.

Avoid putting patient names, national identifiers, diagnoses, test results or other clinical details in generic title, summary or metadata fields. If future validated use requires patient linkage, use a separately assessed integration/reference design with strict minimisation and access controls; do not copy the clinical record into CARELOOP.

## 5. Workflow lifecycles

These are proposed operational states. Clinical policy owners must approve exact meanings before deployment.

### Handover
`draft → awaiting_acknowledgement → acknowledged → in_progress → completed`

A handover can be returned for clarification or marked cancelled by an authorised role. The receiving person must explicitly acknowledge responsibility. A sent handover is not proof that the recipient accepted it.

### Follow-up
`open → acknowledged → in_progress → completed`

An overdue condition is preferably a derived flag based on an active status and due time, rather than a competing status that hides the underlying work state. Reassignment and cancellation must be audited.

### Admission/discharge transition
`open → coordinating → ready_for_human_review → completed`

“Ready for human review” means only that configured operational checklist items are recorded as complete. It is not clinical clearance or authorisation to admit/discharge. Final decisions remain with authorised staff using the hospital's approved process.

No workflow should be automatically marked clinically safe, clinically complete or authorised by a timer or AI.

## 6. API contract (logical, not deployed endpoints)

All operations require an authenticated session and server-side authorisation. Every request must be scoped to the user's organisation, hospital and department.

| Operation | Purpose | Mandatory checks |
|---|---|---|
| List work items | Filter by hospital, department, type, owner, status and due range | Access to every returned row |
| Create work item | Create one of the three workflow types | Role, department, valid type-specific fields, creator identity |
| Assign/reassign | Set or change accountable owner | Owner active and eligible for that hospital and department |
| Acknowledge | Record recipient acceptance | Actor is authorised recipient; idempotent request |
| Update progress | Change allowed operational fields | Valid state transition, version check |
| Complete | Record operational completion | Authorised actor, required checklist rules, completion timestamp |
| Cancel | Close an item without completion | Reason and permission; immutable audit event |
| Read audit history | Review changes | Scoped access; sensitive fields minimised |
| Manage memberships | Invite, assign, suspend or remove staff | Trusted admin service; no self-promotion; audit every change |

Proposed common response fields: `id`, `workflow_type`, `hospital_id`, `department_id`, `status`, `priority`, `owner_user_id`, `due_at`, `version`, `created_at`, `updated_at`.

Use server-generated IDs and timestamps. The client must not submit or override `created_by`, audit actor identity, tenant ownership or authoritative status timestamps. Use an idempotency key for create/acknowledge/complete operations where retry could otherwise duplicate actions. Use optimistic concurrency (for example, an expected version) to prevent silent overwrites.

## 7. Department-level owner eligibility

Before assignment, the server must confirm:

1. The owner account is active.
2. The owner is a current member of the same hospital.
3. The owner has a department assignment matching the workflow department, unless the owner is a hospital administrator with approved hospital-wide scope.
4. Group administrators may administer the organisation but should not automatically be assigned operational tasks unless separately given an eligible hospital membership.
5. A NULL workflow department or NULL member department does not imply broad eligibility for ordinary staff.
6. Assignment, reassignment and acceptance are separately audited.

The current SQL drafts do not yet implement every rule above. Migration 004 scopes editing, but owner eligibility still needs this additional enforcement before production.

## 8. Notifications and escalation

- Due-time evaluation runs on the server, not only in an open browser tab.
- Escalation rules are configurable by hospital policy and workflow type.
- Notifications contain the minimum information necessary; avoid sensitive clinical details in email/SMS/push previews.
- Delivery attempts, failures, retries and acknowledgements are recorded.
- Retries are idempotent; duplicate notifications must not create duplicate work items.
- Quiet hours, emergency policies and local timezone handling require hospital approval.
- CARELOOP does not make clinical urgency judgements. Priority and escalation thresholds are set by authorised staff and approved operational policy.

## 9. Integration approach

Do not start with direct write access to a live EHR.

Recommended stages:
1. Synthetic-data prototype and workflow observation.
2. Documented CSV/API import-export with validation and reconciliation in a test environment.
3. Read-only sandbox integration with an approved partner, if a real customer validates the need.
4. Limited production integration only after security, privacy, clinical safety, contractual and operational approvals.

FHIR/HL7 compatibility is an architectural consideration, not a claim that an integration currently exists. Any mapping must be agreed with the hospital and its system vendor.

## 10. Security, privacy and operational controls

Required before real use:
- Independent review of tenant isolation and every role/policy combination.
- Secure authentication, MFA options, session expiry and account lifecycle.
- Encryption in transit and at rest; secrets management and key rotation.
- Least-privilege database grants and reviewed SECURITY DEFINER functions.
- Immutable, minimised audit events and defined retention.
- Backup encryption, restore testing, disaster recovery and incident response.
- Rate limiting, input validation, abuse monitoring and vulnerability testing.
- Hosting-region/data-residency review and applicable privacy/legal assessment in each target country.
- Clinical safety review, approved operating procedures and staff training.
- Accessibility and usability testing in real workflows using non-patient test data.

## 11. Phased build and validation gates

**Gate A — Workflow validation:** Observe and map current handover, follow-up and admission/discharge coordination. Measure missed/late actions, duplicate work, time to acknowledge, time to close and work carried across shifts. Confirm who owns the problem and budget.

**Gate B — Prototype:** Refine the one integrated UI using synthetic data. Validate task ownership, handover acknowledgement, department queues and transition checklists with representative users.

**Gate C — Disposable backend:** Select a hosting/database option only after comparing cost, data region, security controls, portability and exit path. Execute migrations in a disposable environment and run the full security test plan. No patient data.

**Gate D — Controlled pilot readiness:** Obtain a named healthcare partner, written scope, approvals, data-processing terms, clinical safety review, support plan and rollback plan before any pilot.

**Gate E — Commercial decision:** Establish measurable outcomes, implementation cost, buyer/user budget ownership, strategic fit and a credible outright-sale/IP acquisition route before significant further investment.

## 12. Current implementation truth

- Public front-end demonstration: available at https://juanitavanreenen.github.io/careloop/
- SQL migrations 001–004: draft files committed to GitHub.
- Security test plan: checklist only; tests have not been run.
- Backend/API, authentication, shared database, background worker and integrations: not deployed.
- No real hospital users, pilots, customer commitments or clinical approvals are claimed.
- No patient data should be entered into the demo.
