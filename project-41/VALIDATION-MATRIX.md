# Validation Matrix

| Area | Controlled condition | Expected behavior | Status |
|---|---|---|---|
| Evidence linkage | No linked evidence | Requirement = missing | Defined |
| Evidence verification | Linked but unverified evidence | Requirement = partially established | Defined |
| Evidence verification | All linked evidence verified | Requirement = established | Defined |
| Conflict detection | Different values for same subject | Conflict record created | Defined |
| Critical gate | Critical missing/conflicting/unsupported requirement | Gate blocked | Defined |
| Findings | Critical conflict | Finding remains open until resolved | Defined |
| Actions | Open finding | Resolution action remains open | Defined |
| Evidence versioning | New version supersedes prior version | Prior state retained; reassessment triggered | Defined |
| Package snapshots | Later package differs | Earlier snapshot remains preserved | Defined |
| Lifecycle | Blocked current review | Transition remains blocked | Defined |
| Lifecycle | Resolved current review | Eligible for human gate review | Defined |
| Human decision | No authorized human decision | Outcome remains null | Defined |
| Audit | Duplicate event ID | Event rejected | Defined |

## Interpretation

“Defined” means the software behavior and controlled test expectation have been specified. It is not a claim that production validation has been completed.

Production validation requires execution against representative organizational data, security controls, access roles, document workflows, performance limits and domain-specific gate criteria.
