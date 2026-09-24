# Assurance Data Model v0.2

The system treats project assurance as a connected evidence graph rather than a collection of isolated reports.

## Decision-relevant records

- Project
- Gate
- Requirement
- Document
- EvidenceItem
- Claim
- Assumption
- VerificationRecord
- Conflict
- Gap
- Risk
- Dependency
- ChangeEvent
- Finding
- Action
- Decision
- Reviewer

## Traceability rule

A material decision should be traceable backward through:

Decision
→ Gate
→ Findings / readiness assessment
→ Requirements
→ Claims / assumptions
→ Evidence
→ Source document + version + locator

## Change rule

A new version of evidence does not erase the old version. It creates a change event and can trigger impact analysis across connected requirements, claims, dependencies, risks and gates.

## Verification rule

Evidence may be present without being verified. Presence alone must not be treated as proof.

## Human accountability

The system records who verified evidence and who made or approved a decision. It does not silently substitute an automated conclusion for qualified human judgement.

## Enterprise controls planned

- tenant/project separation
- role-based permissions
- immutable audit events
- document versioning
- controlled exports
- reviewer sign-off
- retention policies
- provenance and checksum tracking
