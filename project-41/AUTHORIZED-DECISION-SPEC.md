# Authorization-Aware Decision Recording Specification

## Purpose
Ensure that a human decision is recorded only after the actor is authorized for the decision-recording action.

## Control sequence
Authenticated actor → role policy → authorization check → exact package/ruleset provenance → human decision record → audit event.

## Rules
- Missing identity/role blocks recording.
- A role without `record_decision` permission is rejected.
- Authorization does not change the assurance result.
- Authorization does not create approval automatically.
- The decision remains tied to the exact package snapshot and ruleset version.

## Production requirements
Authorization must be enforced server-side using authenticated identities, tenant/project scope, session controls and audit logging. Browser UI permissions are not a security boundary.
