# CARELOOP

CARELOOP is a healthcare workflow accountability platform concept combining:
- Shift handovers
- Clinical follow-up tracking
- Admission and discharge coordination

## Current public demonstration

https://juanitavanreenen.github.io/careloop/

The current public page is a front-end demonstration. Its locally created demo records are stored in the visitor's browser only. There is no shared backend, staff authentication, hospital-grade access control, live notification service, or clinical-system integration.

## Repository structure

- `index.html` — current public interactive demonstration.
- `database/001_initial_schema.sql` — draft PostgreSQL/Supabase multi-tenant schema and row-level security policies.

## Database draft scope

The SQL draft models organizations, hospitals, departments, staff profiles, group/hospital memberships, unified workflow records for all three workflows, and append-only audit events.

**Important:** The SQL is a design artefact, not a certified or production-ready security implementation. It has not been executed against a live database or independently security-tested. Before production use, review and test role policies, privilege grants, trigger ownership, user provisioning, tenant isolation, audit retention, backups, encryption, data residency, privacy law, clinical safety, and incident response. Do not enter real patient information into the demo or this unreviewed schema.

## Operating principles

- One integrated platform, not three disconnected apps.
- No diagnosis, prescribing, result interpretation, or autonomous clinical decisions.
- Staff retain clinical responsibility.
- Validate operational need and commercial demand before substantial spend or outreach.
- Prefer a credible outright software/IP sale if buyer demand can be demonstrated.
- No paid services or provisioning without explicit approval.
