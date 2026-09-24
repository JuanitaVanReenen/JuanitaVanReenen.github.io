# Gate Package Snapshot & Comparison Specification

## Purpose
Preserve the exact assurance package presented at a gate review and provide a traceable comparison against a later package.

## Why this matters
A current dashboard can show today's state, but an enterprise assurance system also needs to answer:
- What did reviewers see at the previous gate review?
- Which requirements changed?
- Which evidence was added, removed, superseded or changed?
- Which findings/actions disappeared, changed or were introduced?
- Did readiness change, and what records explain that change?

## Snapshot rule
A snapshot is immutable once captured. Later evidence or assessment changes create a new package/snapshot; they do not rewrite the historical package.

## Comparison scope
The comparison engine covers:
- requirement status
- critical findings
- open actions
- evidence register
- gate readiness

## Decision integrity
The comparison engine reports changes only. It never creates an approval, investment decision or regulatory determination.

## Planned production controls
- immutable storage / write-once retention where required
- authenticated reviewers
- audit event IDs
- package hash/signature
- configuration/ruleset version capture
- source-document locators
- export controls
- tenant and project isolation
