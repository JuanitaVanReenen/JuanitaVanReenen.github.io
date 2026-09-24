# Role and Access Control Specification

## Purpose
Define a least-privilege role model for the assurance workflow.

## Initial roles
- Project analyst — view and prepare records.
- Evidence reviewer — view and verify evidence.
- Gate reviewer — review gates and record authorized human decisions.
- System administrator — administer assurance ruleset configuration.

## Principle
Role policy is separate from the assurance result. A technically ready package does not grant a user permission to make a decision.

## Production requirements
Authorization must be enforced server-side with authenticated identities, tenant/project isolation, least privilege, session controls, audit logging and periodic access review.

The browser demonstration must never be treated as an authorization boundary.
