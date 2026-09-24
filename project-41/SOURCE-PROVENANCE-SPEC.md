# Source and Document Provenance Specification

## Purpose
Make the origin of evidence traceable to a specific document version and source locator.

## Required chain
Source reference → Document → Document Version → Evidence Item → Claim → Requirement → Finding/Decision.

## Controls
- Every evidence item must identify its source document version.
- Every evidence item must include a locator such as page, section, table, drawing reference or system record identifier.
- Superseded document versions remain historical records.
- Verification status is separate from source presence.
- Extracted evidence must not silently become verified evidence.

## Production direction
Document storage, access permissions, retention, malware scanning, encryption and immutable version history must be implemented server-side.
