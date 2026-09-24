# Cross-Gate Lifecycle Specification

## Purpose
Track assurance state across successive project decision gates without rewriting prior reviews.

## Review model
Each gate review records:
- gate identity and lifecycle stage
- decision-package snapshot
- readiness at that moment
- unresolved finding IDs
- open action IDs
- evidence-change IDs
- downstream impact IDs
- human decision record

## Lifecycle rule
A later gate does not erase an earlier gate review. Each review remains independently auditable.

## Transition analysis
The lifecycle layer reports:
- stage transition
- readiness change
- findings/actions carried forward
- evidence changes
- downstream impacts
- whether a human decision was recorded

## Important control
"Ready for human decision" is not the same as approved. The software never creates an approval automatically.

## Production direction
A production implementation should additionally enforce:
- gate configuration/versioning
- authorized reviewers
- decision authority rules
- immutable review storage
- signed decision records where required
- controlled transition permissions
- complete source/evidence lineage
