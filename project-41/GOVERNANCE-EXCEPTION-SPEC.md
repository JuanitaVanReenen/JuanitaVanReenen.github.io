# Governance Exception Specification

## Purpose
Provide a controlled path for exceptional cases without silently bypassing assurance or security controls.

## Principle
An exception is an explicit, time-bounded governance record. It does not delete or rewrite the underlying control conflict.

## Required controls
- identified control
- requester
- documented reason
- defined scope
- compensating controls
- authorized approver
- approval timestamp
- expiry date

## Rules
- Proposed exceptions cannot be used as approved exceptions.
- Approved exceptions require approval provenance and compensating controls.
- Expired exceptions are not valid.
- Exceptions remain visible in the audit history.

## Production direction
Exception authority, approval thresholds, segregation of duties, expiry enforcement and audit retention must be organization-specific and server-enforced.
