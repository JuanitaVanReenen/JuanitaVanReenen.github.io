# Dependency Assurance Specification

## Purpose
Make downstream consequences explicit when evidence, findings or project changes affect dependencies.

## Behavior
A dependency is marked **affected** when:
- it links to an unresolved finding; or
- it links to a recorded change.

Affected dependencies retain their identity and source links. The system then maps them to configured downstream gate IDs.

## Control
Dependency impact is an assurance signal, not an automatic decision or approval.

## Production direction
Production implementations should add dependency ownership, severity, due dates, interface contracts, prerequisite logic and organization-specific gate rules.
