# Tenant and Project Isolation Specification

## Purpose
Define the boundary required when the assurance system serves multiple organizations and projects.

## Scope
Every persisted assurance record must carry an explicit:
- tenant/organization identifier;
- project identifier.

## Controls
- Reads are scoped to the authenticated tenant and project.
- Cross-tenant records must be rejected.
- Cross-project records must not appear in scoped queries.
- Scope is retained when records are versioned or exported.

## Production requirement
This policy must be enforced server-side and backed by database-level authorization where available. Browser filtering is not a security boundary.
