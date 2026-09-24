# Decision Provenance Specification

## Purpose
Preserve the exact context surrounding an authorized human gate decision.

## Decision record
A decision records:
- decision identity;
- gate;
- exact package snapshot;
- exact ruleset ID/version;
- decision maker;
- outcome;
- rationale;
- timestamp;
- supporting source references.

## Control principle
The software may prepare and preserve the decision context. It does not create the decision.

## Integrity
A recorded decision must be verifiable against the snapshot and ruleset references that were presented at the time.

## Production direction
Production systems should add authorization checks, digital signatures where required, organizational roles, immutable storage and retention policies.
