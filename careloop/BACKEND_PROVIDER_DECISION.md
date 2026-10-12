# CARELOOP backend provider decision record

**Status:** Shortlist and decision criteria only. No provider has been selected, provisioned or paid for.

## Decision required

CARELOOP needs a relational database, managed authentication, server-side authorisation, background jobs and a deployable API. The public GitHub Pages demo is static and cannot provide shared multi-user records or secure secrets.

## Shortlist

| Option | Strengths | Risks / questions for CARELOOP |
|---|---|---|
| Supabase managed (direct project) | PostgreSQL, authentication, row-level security, SQL migrations, storage and edge functions in one platform | Confirm available hosting region, data residency, free-tier limits, backup/PITR availability, compute limits, pricing at pilot scale and portability. A free tier is not a production healthcare hosting approval. |
| Lovable-managed Supabase database | Convenient connection to the existing Lovable project; less initial setup | Current project database is disabled and Lovable workspace has run out of build credits. Provisioning may create ongoing charges; do not enable without cost confirmation and explicit approval. |
| Self-hosted PostgreSQL + application API | Maximum deployment and source-code control; potential handover portability | Requires secure hosting, patching, monitoring, backups, authentication, incident response and specialist operations. “Free software” does not mean free or safe hosting. |
| Appwrite or another managed backend | Could provide authentication and backend services with a self-host option | Would need a careful relational/tenant-permission fit review; migration and operational complexity; region, pricing, backup and export need confirmation. |

## Current recommendation

Keep the provider **unselected** until these checks are completed:

1. Confirm a suitable hosting region and lawful handling of data for the first intended customer country.
2. Obtain written, current pricing for development, test and a small pilot, including backups, egress, authentication, functions and database compute.
3. Confirm the customer can own or receive the complete source code, schema, migration history, data export and deployment documentation.
4. Confirm the backend supports enforceable organisation, hospital and department isolation.
5. Confirm authentication, MFA, audit retention, backup restore and incident response requirements.
6. Confirm whether the intended strategic buyer would accept the selected stack.

A low-cost disposable test environment may be considered only after costs and data region are checked. It must contain synthetic data only. No paid plan, database provisioning, domain purchase or live integration is authorised by this document.

## Lovable status

The existing CARELOOP Lovable project was scaffold-only and its workspace previously reported no remaining credits. Its cloud database was disabled when last checked. Do not treat the Lovable preview as a running backend. Do not enable its database or buy credits without the user's explicit approval after explaining the cost and alternatives.

## Deployment separation

- **Demo:** GitHub Pages static site; fictional data stored locally in the browser.
- **Development/test backend:** isolated environment, synthetic accounts/data only.
- **Pilot/production:** separate environment, approved region, security/privacy/clinical reviews, customer contract and tested backup/restore. Never promote the demo database directly into production.

## Exit and outright-sale readiness

The eventual handover package should include source code, schema, ordered migrations, environment-variable inventory (not secret values), deployment instructions, backup/export procedure, test suite, architecture, third-party dependency list, licence inventory and known limitations. Avoid proprietary platform lock-in where it materially harms transferability.

## Decision gate

Do not build a live clinical backend until the first target buyer/customer and operational workflow are validated, the region and total cost are known, and the customer security requirements are understood. The current architecture and SQL drafts are preparatory work only.
