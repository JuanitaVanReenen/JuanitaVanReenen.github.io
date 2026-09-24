# Project 41 — Technical Architecture v0.1

## System layers

### 1. Project Workspace
Project profile, stage, gate, stakeholders, dates and project configuration.

### 2. Requirements Layer
Configurable requirements by project stage and gate.

### 3. Evidence Layer
Documents, data points, sources, provenance, page/section references, evidence status and verification history.

### 4. Knowledge / Claims Layer
Claims and assumptions extracted from project information, linked to requirements and evidence.

### 5. Assurance Graph
Relationships among requirements, evidence, claims, assumptions, conflicts, dependencies, risks, changes and gates.

### 6. Decision Engines
Rule-based checks for completeness, consistency, traceability, change impact and gate readiness.

### 7. Reporting Layer
Finding records, action lists, gate packs, evidence lineage and executive summaries.

## Initial entities
- Project
- ProjectStage
- Gate
- Requirement
- EvidenceItem
- Document
- Claim
- Assumption
- Conflict
- Dependency
- Risk
- ChangeEvent
- Finding
- Action
- Decision
- Reviewer
- SourceReference
- VerificationRecord

## Core relationship examples
- Requirement is supported_by EvidenceItem
- Claim is derived_from EvidenceItem
- Assumption affects Requirement
- Conflict concerns Claim/Assumption
- Conflict affects Dependency
- Dependency affects Gate
- Finding references EvidenceItem
- ChangeEvent affects Claim/Assumption/Requirement
- Decision resolves Finding
- VerificationRecord verifies EvidenceItem or Finding

## Design principle
Important outputs must be explainable and traceable to source evidence and deterministic rules. AI may assist with extraction and discovery, but must not silently replace the evidence chain or qualified human decisions.

## Security / enterprise direction
Future production architecture should support authentication, role-based access, tenant/project separation, audit logs, document access controls, encrypted storage and controlled exports.

## Non-goals
Do not attempt to reproduce mature hydraulic, process-engineering, GIS or digital-twin platforms. The system is an assurance and traceability layer across project information.
