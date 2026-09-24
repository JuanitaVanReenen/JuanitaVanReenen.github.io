# Integrity Control Specification

## Purpose
Provide tamper-evident integrity metadata for evidence and assurance package records.

## Principle
A stored artifact should be independently checkable against the integrity metadata associated with it.

## Initial control
The foundation uses SHA-256 over a deterministic serialization of the record.

## Scope
Integrity metadata may be attached to:
- evidence versions;
- decision package snapshots;
- exported assurance reports;
- signed human decision records.

## Production requirements
Production storage should use canonical serialization, immutable/versioned object storage, protected metadata, access controls and audit logging. Cryptographic hashes do not by themselves prove authorship, authorization or regulatory validity.
