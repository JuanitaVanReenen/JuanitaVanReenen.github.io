# Versioning, Change Impact and Audit Specification v0.1

## Purpose

Preserve the history of decision-relevant evidence and make material changes visible across the assurance chain.

## Evidence versioning

Every material evidence record has:
- stable evidence identifier
- version number
- source/document reference
- recorded timestamp
- superseded version reference
- verification state
- optional reason for change

Earlier versions remain part of the audit history.

## Change propagation

A material change can trigger reassessment of:
- linked claims
- requirements
- assumptions
- conflicts
- dependencies
- risks
- findings/actions
- decision gates
- prior decision packages

## Audit events

The system records events such as:
- evidence added
- evidence revised
- verification completed
- conflict created/resolved
- finding opened/closed
- gate package generated
- human decision recorded
- decision package amended

## Integrity principle

The assurance system should behave as a historical record, not a spreadsheet where old facts disappear when a new value is entered.

Production implementation should use server-side timestamps, authenticated identities, immutable/append-only audit storage and concurrency controls.
