# Assurance Workflow API Contract v0.1

The production system should expose the integrated workflow behind an authenticated service boundary.

## Inputs

- project
- gate
- requirements
- evidence
- claims
- assumptions
- findings
- actions
- changes
- prior decisions
- configuration/ruleset version

## Outputs

- requirement assessments
- conflicts
- evidence lineage status
- dependency/change impacts
- findings
- gate readiness
- decision package
- audit references

## Important invariant

The service must never return "approved" merely because the automated rules pass. The appropriate automated state is "ready for human decision" when configured blockers are cleared.

## Future API controls

- authenticated access
- authorization by tenant/project
- idempotent write operations
- optimistic concurrency/version checks
- audit event IDs
- schema validation
- rate limiting
- controlled export endpoints
