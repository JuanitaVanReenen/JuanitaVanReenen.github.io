# Ruleset Governance Specification

## Purpose
Control changes to the assurance rules that determine how requirements and gates are assessed.

## Principle
A ruleset is a governance artifact, not an ordinary application setting.

## Change chain
Proposed change → impact/evidence review → authorized human review → approval record → effective version → historical traceability.

## Rules
- Existing historical packages retain their original ruleset reference.
- A new ruleset version cannot become effective solely because a file/configuration changed.
- Publication requires an accountable review record, supporting evidence and an effective date.
- Ruleset governance is separate from project gate decisions.

## Production direction
Ruleset publication should require authenticated roles, dual-control where appropriate, immutable version records, testing, change approval and audit events.
