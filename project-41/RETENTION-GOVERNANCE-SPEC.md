# Retention and Governance Specification

## Purpose
Define controlled retention of evidence, assurance records and decision history.

## Principles
- Historical evidence and decisions must not disappear simply because a newer version exists.
- Retention policy is explicit and versionable.
- Legal hold or equivalent preservation requirements override ordinary disposal evaluation.
- Disposal must never be inferred from an assurance result.

## Controlled record classes
- source/document versions
- evidence versions
- assurance ledger events
- package snapshots
- gate reviews
- human decisions
- authorization/security audit events

## Production requirements
Actual retention and disposal must be enforced server-side, authorized, logged and aligned with the applicable contractual, legal and regulatory requirements. This foundation deliberately performs policy evaluation only; it does not delete records.
