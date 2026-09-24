# Risk Assurance Specification

## Purpose
Connect evidence assurance to project risk without turning the software into an autonomous risk decision-maker.

## Model
Finding → Dependency → Risk → Downstream Gate.

A risk becomes assurance-affected when an unresolved finding or affected dependency is explicitly linked to it.

## Controls
- Existing risk records are preserved.
- The system exposes the source finding/dependency links.
- Active risk status remains visible.
- Gate impact is reported for human review.
- No automatic risk acceptance, closure or project approval is performed.

## Production direction
Production use should add risk owners, probability/impact methodology, control effectiveness, treatment plans, review dates and organization-specific risk taxonomies.
