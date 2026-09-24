# Control Attestation Specification

## Purpose
Add accountable human review to automated control-health monitoring.

## Distinction
Automated monitoring answers: "What does the current control telemetry/test indicate?"
Human attestation answers: "Has an authorized reviewer assessed the control evidence and recorded an accountable conclusion?"

## Required record
- attestation ID
- control ID
- authorized reviewer
- outcome
- review timestamp
- supporting evidence references
- rationale
- next review date where applicable

## Rules
- Attestation does not alter the underlying control test result.
- A control can require attention even when its last automated test passed.
- Historical attestations remain preserved.
- Attestation must not be treated as project approval.

## Production direction
Attestations require authenticated reviewer identities, authorization, immutable audit records, controlled evidence references and organization-specific review cadence.
