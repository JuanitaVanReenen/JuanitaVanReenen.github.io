# CARELOOP

CARELOOP is a proposed integrated healthcare workflow accountability platform. It brings together shift handovers, clinical follow-up tracking and admission/discharge coordination so operational actions have a named owner, acknowledgement, due date, status and traceable history.

## Public demonstration

- Demo: https://juanitavanreenen.github.io/careloop/
- The current public demo is a front-end prototype. New demo records are stored locally in the browser.
- Use fictional sample information only. Do not enter patient names, identifiers, diagnoses, results or other patient-identifiable information.

## Product boundary

CARELOOP is intended to complement existing hospital systems, not replace an electronic health record or hospital information system. It tracks operational tasks and accountability. It must not diagnose, prescribe, interpret clinical results, or make or authorize clinical decisions.

## Repository map

- `index.html` — browser-based demonstration.
- `database/001_initial_schema.sql` — initial PostgreSQL/Supabase data model and row-level security draft.
- `database/002_security_hardening.sql` — immutable workflow identity fields and reduced audit payloads.
- `database/003_membership_policy_correction.sql` — membership checks used by workflow owner validation.
- `database/004_department_scope.sql` — department-scoped workflow editing and membership visibility.
- `database/005_owner_department_eligibility.sql` — department-aware owner assignment.
- `SECURITY_TEST_PLAN.md` — pre-production security and release checklist.
- `BACKEND_ARCHITECTURE.md` — proposed backend, API, roles, workflow lifecycles and integration stages.
- `BACKEND_PROVIDER_DECISION.md` — provider shortlist, cost guardrails and deployment decision gate.
- `STAFF_WORKSPACE_SPEC.md` — six role-specific views over the same integrated workflows and shared accountability model.

## Database migration order

The SQL files are draft migrations and must be reviewed and applied in numerical order in a disposable test database:

1. `database/001_initial_schema.sql`
2. `database/002_security_hardening.sql`
3. `database/003_membership_policy_correction.sql`
4. `database/004_department_scope.sql`
5. `database/005_owner_department_eligibility.sql`

**None of these migrations has been run against a live or disposable database in this project.** Their syntax and intended logic have received a limited source review only. That is not equivalent to execution, integration testing, penetration testing, or independent security approval. Do not connect live hospital systems or patient data.

## Known limitations

- No production backend, shared database, staff authentication, or multi-user synchronisation is connected to the public demo.
- Demo records are browser-local and are not encrypted clinical records.
- There are no live notifications, server-side escalations, or real hospital integrations.
- Membership provisioning and role administration require a separately designed trusted administrative service; browser-side role changes are intentionally not enabled in the draft.
- The database drafts still require execution in an isolated environment, role-by-role RLS tests, specialist security review, privacy/legal review, clinical safety review, and hosting/data-residency decisions.
- Department-aware owner eligibility has a draft migration, but requires execution and role-by-role testing before production. Only operational roles (department manager, clinician, staff) and hospital administrators are eligible owners; viewers are excluded.
- The public demonstration must not be represented as a certified clinical system or production-ready hospital platform.

## Validation and commercial direction

Before paid infrastructure, live integrations or broad outreach, validate the workflow problem with appropriate healthcare operations and clinical stakeholders. Establish who owns the problem, what systems are already used, what measurable operational improvement is needed, who controls the budget, and whether a credible pilot or acquisition route exists.

The preferred commercial outcome is an outright software/IP sale where a credible strategic buyer exists. No company has endorsed, agreed to buy, or committed to pilot CARELOOP unless separately documented.

## Security and privacy principles

- Use synthetic data during prototype and testing.
- Enforce organisation, hospital and department boundaries on the server.
- Keep authentication secrets and service-role credentials out of browser code.
- Minimise audit data and restrict audit-log modification.
- Define retention, backups, encryption, incident response and data residency before any real deployment.
- Require qualified security, privacy, legal and clinical review before handling patient information.
