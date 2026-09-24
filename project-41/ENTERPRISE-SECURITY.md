# Enterprise Security and Governance Direction

This is an architectural target, not a claim that all controls are already implemented.

## Required controls

- tenant isolation
- project-level authorization
- role-based access control
- least-privilege document access
- encrypted data in transit and at rest
- immutable audit events
- evidence versioning and provenance
- controlled export
- reviewer and decision-maker accountability
- retention/deletion policies
- backup and recovery procedures

## Sensitive assurance data

Project evidence may include commercially sensitive engineering, environmental, regulatory and financial information. Production implementation therefore requires formal security review, threat modelling, access testing and appropriate infrastructure controls.

## AI governance

If AI is later used to extract or classify evidence, every AI-assisted output should retain provenance, confidence/uncertainty metadata and a human verification state. AI output must not silently become authoritative evidence.
