# CARELOOP staff workspace specification

## Purpose

Define one coherent staff workspace for CARELOOP. The role-specific screens are views over the same workflow records, permissions and audit history—not separate products or separate apps.

CARELOOP tracks operational accountability. It does not replace the clinical record, make clinical decisions, interpret results, prescribe, or authorize admission/discharge decisions.

## Shared interaction model

Every operational item should present, where applicable:
- Workflow type: handover, follow-up, or admission/discharge transition.
- Hospital and department.
- Short operational task description (no patient-identifiable details in the prototype).
- Named accountable owner and creator.
- Priority, due time, current status, and last update.
- Acknowledgement state and next required action.
- Escalation state, if overdue or blocked.
- Audit history showing who changed what and when.

The interface should make the next action obvious. Avoid dashboards that show a number without letting the user open the underlying work.

## Role workspaces

### 1. Nurse / frontline staff — My work

Primary question: **What must I acknowledge or complete during this shift?**

Show:
- Assigned handovers awaiting acknowledgement.
- Follow-up tasks assigned to the staff member.
- Admission/discharge coordination steps assigned to the staff member.
- Due soon, overdue and blocked work, clearly separated.
- Quick actions: acknowledge, update progress, mark complete, or flag a blocker.

Rules:
- Only show work the signed-in user is authorised to see.
- Do not allow a user to silently close another person's task.
- Completion should capture actor and timestamp; require a reason for reopening or cancelling where configured.
- Do not display patient identifiers in the demonstration.

### 2. Receiving nurse — Shift handover

Primary question: **What am I taking responsibility for from the previous shift?**

Show:
- Incoming handovers grouped by urgency and department.
- Outstanding actions and their named owners.
- Items not yet acknowledged.
- Items carried forward from earlier shifts.
- A clear acknowledgement action and a way to flag missing or unclear information.

Rules:
- Acknowledgement confirms receipt, not clinical agreement or completion.
- Preserve the prior shift's record; do not overwrite history.
- An unacknowledged handover remains visibly outstanding.

### 3. Doctor / clinician — Follow-up queue

Primary question: **Which assigned follow-up actions still need my attention?**

Show:
- Assigned follow-up items ordered by urgency and due time.
- Items awaiting review, action, referral coordination or another operational step.
- Blocked items and the reason they are blocked.
- A way to record the operational outcome and route the next action to an eligible colleague.

Rules:
- CARELOOP records that a follow-up action is pending or completed; it does not interpret test results or recommend treatment.
- Clinical content belongs in the authorised clinical system, not free-text CARELOOP fields.
- A completed task must not be mistaken for a clinical decision or patient notification unless that action is explicitly recorded elsewhere.

### 4. Department manager — Department accountability

Primary question: **What is outstanding in my department, and where is ownership unclear?**

Show:
- Open work by workflow type, status, priority and owner.
- Overdue and unassigned items.
- Workload distribution and items at risk of crossing a deadline.
- Department handover continuity and unresolved blockers.
- Filters for date range and workflow type.

Actions:
- Reassign work only to eligible active members in the same authorised scope.
- Escalate or request support.
- Review an item's history.

Rules:
- A department manager must not see or edit another department's operational records unless separately granted a broader role.
- Metrics must be calculated from records the manager is permitted to access.

### 5. Hospital administrator — Hospital operations

Primary question: **Where is operational work accumulating across this hospital?**

Show:
- Hospital-wide totals for handovers, follow-ups and transitions.
- Overdue, blocked, unassigned and ageing work.
- Department comparisons using consistent definitions.
- Workload and escalation trends.
- Role and membership administration only through a trusted administrative service.

Rules:
- Hospital-wide visibility does not imply unrestricted clinical-record access.
- Membership changes must be audited and performed server-side.
- Hospital administrators may manage operational ownership within the hospital, subject to the configured policy.

### 6. Group executive — Multi-hospital overview

Primary question: **Which hospitals need operational attention, and what patterns require action?**

Show:
- A group-level summary with each hospital's open, overdue and blocked workload.
- Comparable trend measures across hospitals.
- Drill-down to hospital and department only where the user's group-level permissions allow it.
- A clear distinction between missing data and zero outstanding work.

Rules:
- Group-level aggregation should avoid unnecessary patient-level detail.
- A group administrator's organisation-wide permissions must be explicitly approved and tested.
- Cross-organisation access is never implied.

## Authorisation and data-scope model

The six workspaces are presentation choices, not six independent security roles. Production access must be derived from a verified user identity plus explicit organisation, hospital, department and assignment memberships. A user may hold more than one approved role, but the server must apply the narrowest applicable scope to each request and record administrative changes.

### Scope and capability matrix

| Workspace role | Permitted data scope | Permitted operational capabilities | Explicit limits |
|---|---|---|---|
| Group executive | Aggregated summaries for explicitly linked hospitals in one organisation | View group trends; drill into a hospital only when separately authorised | No automatic access to individual clinical follow-ups, patient data, or another organisation |
| Hospital administrator | Operational records across one assigned hospital | View hospital workload; manage operational ownership and escalations; administer membership only through a trusted audited service | No cross-hospital access by default; no clinical-record access |
| Department manager | Records in explicitly assigned department(s) at one hospital | Review department queue; assign/reassign to eligible active members in the same permitted scope; intervene and escalate | Cannot browse or edit other departments by default |
| Nurse / frontline staff | Items assigned to the authenticated staff member, plus handovers and records explicitly shared with them | Acknowledge, progress, flag blockers and complete permitted assigned actions | Cannot silently close another person's work, change membership, or browse the whole department |
| Receiving nurse | Incoming handovers explicitly addressed to that authenticated recipient, plus accepted carried-forward items | Review and accept/acknowledge receipt; flag missing or unclear operational information; act on accepted assigned items | Cannot accept a handover addressed to another person; receipt is not clinical agreement |
| Clinician | Operational follow-ups explicitly assigned or shared within the clinician's authorised hospital/department scope | Acknowledge, update operational status, record coordination outcome and route next operational action to an eligible colleague | No result interpretation, diagnosis, treatment recommendation, prescribing, or clinical authorisation |

### Mandatory server-side checks

1. Resolve the authenticated user and active organisation membership from trusted identity records; never trust a role, hospital ID, department ID or owner ID supplied by the browser alone.
2. Check organisation membership first, then hospital membership, then department membership, then record assignment/sharing and action-specific capability.
3. Enforce tenant isolation on every read, write, export, search, aggregate and realtime subscription. Deny by default when membership or scope is missing or ambiguous.
4. Treat group-wide visibility as an explicit grant for a named organisation and approved hospitals, not as a consequence of a display label such as “group executive”.
5. Validate reassignment eligibility server-side: recipient must be active, in the same authorised organisation/hospital, eligible for the workflow and permitted department scope. Preserve the prior owner and reason.
6. Restrict receiving-nurse acceptance to the intended recipient or an explicitly authorised delegate; preserve outgoing ownership until acceptance succeeds.
7. Restrict manager intervention, membership administration, exports and audit access to explicit capabilities; log actor, timestamp, target, scope and reason.
8. Return only fields needed by the workspace. Do not expose sensitive clinical data in operational list endpoints or notification payloads.
9. Re-check authorisation at the moment of every state transition. UI hiding and client-side role selectors are never security controls.
10. Test both allowed and denied cases, including attempts to change IDs, query another hospital, enumerate departments, export cross-tenant data, accept another user's handover and invoke manager-only actions.

### Acceptance tests to add before any backend release

- Group executive linked to Hospital A and B cannot retrieve Hospital C or another organisation.
- Hospital administrator for Hospital A cannot retrieve or mutate Hospital B records.
- Department manager for Department X cannot list, export, reassign or intervene on Department Y records.
- Frontline staff cannot view unassigned department-wide queues or complete another user's item unless explicitly shared and authorised.
- Receiving nurse cannot acknowledge a handover addressed to a different recipient.
- Clinician cannot access follow-ups outside their approved membership/assignment scope and cannot invoke clinical decision functions.
- A removed or suspended member loses access immediately, including active sessions and subscriptions.
- Forged role, hospital, department, owner or workflow identifiers are rejected server-side.
- Cross-scope counts, search results, exports and error messages do not leak record existence or metadata.

## Common workflow lifecycle

Use explicit, workflow-specific transitions rather than one generic status dropdown.

- **Handover:** draft → ready for handover → acknowledged → closed; allow a carried-forward state for unresolved actions.
- **Follow-up:** open → acknowledged/in progress → blocked or completed; allow cancellation only with a recorded reason and authorised role.
- **Admission/discharge coordination:** planning → coordination in progress → operational steps complete → closed. This records coordination only; CARELOOP never authorises admission or discharge.

The backend must validate transitions. The browser must not be trusted to enforce lifecycle rules.

## Accessibility and usability

- Responsive desktop, tablet and mobile layouts.
- Keyboard-operable navigation and controls.
- Visible focus states, readable contrast and labels that do not rely on colour alone.
- Clear timestamps with the hospital's configured timezone.
- Plain language, consistent terminology and concise empty states.
- Confirm destructive or consequential actions; explain why an action is unavailable.

## Data and safety boundaries

- Demonstration data must be fictional.
- Do not store patient names, national identifiers, diagnoses, results or other patient-identifiable information in the public demo.
- The production design must minimise data, define retention, and undergo privacy, security and clinical safety review.
- Acknowledgement and task completion are operational events, not proof that clinical care was appropriate or that a patient was informed.
- Notifications must be minimal and avoid sensitive clinical content.

## Acceptance criteria before backend implementation

1. A staff member sees only work within their permitted hospital/department scope.
2. Each open item has an accountable owner or is clearly marked unassigned.
3. Every acknowledgement, reassignment, status change and closure is attributable and timestamped.
4. Invalid lifecycle transitions are rejected server-side.
5. Overdue and blocked work is visible to the correct manager without leaking across tenants.
6. Group summaries reconcile with authorised hospital-level records.
7. User interface actions have clear success/failure feedback and prevent duplicate submissions.
8. All six role views use the same underlying workflow model and audit history.
9. Tests use synthetic data in an isolated environment.
10. No live patient data or hospital integration is enabled until independent review and explicit release approval.

## Current implementation status

This document is a product/UX specification, not evidence that these six role workspaces or their permissions are implemented. The public CARELOOP page remains a browser-only demonstration. Backend migrations are draft files and have not been executed or tested against a database.
