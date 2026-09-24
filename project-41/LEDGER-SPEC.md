# Project Assurance Ledger Specification

## Purpose
The assurance ledger creates a chronological record of material assurance events across the project lifecycle.

It is not a replacement for source systems. It is the traceability layer connecting source evidence and assurance outcomes.

## Event coverage
The initial event vocabulary covers:
- evidence added or versioned
- claims changed
- requirements reassessed
- findings created/resolved
- actions created/completed
- gate assessments
- package snapshots
- recorded human decisions

## Integrity rules
1. Event IDs are unique within the ledger.
2. Recorded events are immutable at the application layer.
3. Events retain timestamps and source references.
4. Historical events are not overwritten when a later event occurs.
5. The ledger does not manufacture approval or regulatory status.

## Production direction
A production implementation should add:
- append-only database controls
- authenticated actor identity
- cryptographic integrity mechanisms where required
- retention policies
- tenant/project isolation
- audit export
- clock/time synchronization controls
- access logging
