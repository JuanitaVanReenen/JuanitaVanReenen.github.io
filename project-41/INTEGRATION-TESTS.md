# Integrated Workflow Test Plan v0.1

## Scenario A — conflicting project

Input: controlled desalination fixture with two capacity claims.

Expected:
- TECH-002 becomes conflicting
- conflict is surfaced
- critical gate is blocked
- decision package says blocked pending resolution
- critical finding remains open

## Scenario B — resolved project

Input: controlled project with one verified capacity basis.

Expected:
- no capacity conflict
- critical requirements are not blocked by missing/conflicting/unsupported status
- decision package can reach human-decision-ready state
- the system still requires an explicit human decision

## Scenario C — evidence version change

Input:
- replace an earlier evidence version with a newer version
- preserve both versions
- create a change event
- calculate downstream impact
- require re-verification where configured

## Scenario D — unresolved action

Input:
- critical finding remains open
- action remains incomplete

Expected:
- gate remains blocked
- package retains the open action and required evidence

## Quality rule

Tests must distinguish:
1. evidence exists,
2. evidence is verified,
3. requirement is established,
4. gate is ready for human decision.

These are deliberately different states.
