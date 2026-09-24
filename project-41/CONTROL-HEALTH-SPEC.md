# Control Health Monitoring Specification

## Purpose
Make governance controls observable instead of assuming that a control remains effective after it is implemented.

## Control lifecycle
Defined → Tested → Monitored → Reviewed → Retested.

## Initial monitored controls
- tenant/project isolation
- authorization
- source provenance
- record integrity
- retention governance
- backup/recovery
- incident response

## Rules
A control with no current test record is not reported as healthy.
A failed control is surfaced separately from an engineering assurance finding.
Control health does not approve or reject a project.

## Production direction
Production monitoring should use authenticated service telemetry, alerting, time-based test schedules, immutable audit records and role-based access to control reports.
