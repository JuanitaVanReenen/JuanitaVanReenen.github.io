# Change Assurance Specification

## Purpose
Provide a controlled impact assessment whenever project evidence, assumptions or other configured project objects change.

## Impact path
Change → Requirements → Dependencies → Risks → Gates.

## Controls
- The change itself remains part of the historical record.
- Impact is calculated from explicit relationships.
- Affected objects are identified for reassessment.
- Gate impact is exposed for human review.
- The engine never silently rewrites prior gate records.

## Production direction
Production implementations should support change authorship, reason codes, effective dates, approvals/workflows, configuration versions and organization-specific impact policies.
