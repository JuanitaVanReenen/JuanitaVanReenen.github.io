# Validation Plan — Water Infrastructure Decision Assurance

## Purpose
Validate that the assurance system behaves deterministically and preserves traceability under realistic project evidence changes.

## Controlled test families

### 1. Requirement evidence
- no evidence → missing
- unverified evidence → partially established
- all linked evidence verified → established
- declared conflicting evidence → conflicting

### 2. Claim conflicts
- one authoritative claim → no conflict
- two different values for the same subject → conflict
- identical repeated claims → no value conflict

### 3. Gate readiness
Critical missing, conflicting or unsupported requirements must prevent a package from becoming ready for human decision.

### 4. Evidence version change
A new evidence version must:
- preserve the previous version;
- create a traceable change event;
- trigger reassessment of linked claims/requirements;
- expose downstream impacts where configured.

### 5. Package snapshots
Each gate review must preserve its exact package state. Later changes must not mutate the earlier snapshot.

### 6. Lifecycle transitions
A transition may be:
- blocked pending resolution; or
- eligible for human gate review.

The system must never emit an automatic approval.

### 7. Human decision separation
A package may be ready for human decision while its human decision outcome remains null.

## Test data standard
Controlled fictional datasets should deliberately contain:
- conflicting technical values;
- incomplete evidence;
- superseded evidence;
- unresolved dependencies;
- resolved findings;
- changed assumptions;
- downstream gate impacts.

## Production validation still required
Before use on real infrastructure projects, the system requires qualified domain review, security testing, access-control testing, data-integrity testing, document ingestion validation, performance testing, and validation against real organizational gate criteria.

This plan defines software behavior; it does not certify engineering, regulatory or investment decisions.
