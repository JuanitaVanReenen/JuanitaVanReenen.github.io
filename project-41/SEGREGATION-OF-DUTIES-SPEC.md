# Segregation of Duties Specification

## Purpose
Reduce governance risk by separating preparation, verification and decision authority where required.

## Core separation
A person or service that prepares assurance material should not silently become the sole verifier and decision maker for the same gate.

## Initial controls
- preparation vs decision
- verification vs decision
- ruleset administration vs ordinary preparation

## Rules
- Separation policies are configurable by organization and gate.
- A separation conflict blocks the affected governance action until resolved or explicitly governed by an authorized exception process.
- Separation status is recorded separately from engineering assurance.

## Production direction
Production enforcement requires authenticated identities, role history, conflict-aware authorization, exception approval, audit records and organization-specific policy configuration.
