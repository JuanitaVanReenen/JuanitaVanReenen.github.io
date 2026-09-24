# Backup and Recovery Specification

## Purpose
Protect the continuity of assurance records and decision history.

## Required recovery metadata
- backup identifier
- covered scope
- creation timestamp
- storage reference
- integrity reference where available
- recovery-test timestamp
- verification status

## Principle
A backup existing is not the same as a tested recovery path.

## Protected record classes
Evidence versions, assurance ledger events, package snapshots, gate reviews, human decisions and authorization audit events.

## Production requirements
Production recovery requires isolated backup storage, encryption, access control, documented recovery objectives, regular restore testing, monitoring and incident procedures. The browser demonstration is not a backup system.
