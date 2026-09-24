# Gate Transition Rules Specification

## Purpose
Determine whether the assurance record is sufficiently resolved to be presented for human review at a subsequent gate.

## Outcomes
- `blocked_pending_resolution`: known blockers remain.
- `eligible_for_human_gate_review`: the package can be presented to authorized humans for gate review.

The engine must never emit an approval outcome.

## Blocking conditions
The initial rules block transition presentation when:
- no current review exists
- no target gate is configured
- current readiness is not `ready_for_human_decision`
- unresolved findings remain
- open actions remain

## Control principle
Eligibility for human review is not approval.

## Production direction
A production implementation should add:
- gate-specific blocking rules
- severity thresholds
- authorized decision roles
- prerequisite gates
- dependency conditions
- evidence verification thresholds
- configuration/ruleset versioning
