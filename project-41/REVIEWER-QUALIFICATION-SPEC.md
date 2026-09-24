# Reviewer Qualification Specification

## Purpose
Add an explicit qualification record to human review governance.

## Principle
Authorization answers whether a role may perform an action. Qualification answers whether the reviewer has the required current qualification for the relevant domain and scope.

## Required record
- qualification ID
- reviewer ID
- domain
- scope
- validity period
- status
- supporting evidence references

## Rules
- An authorized role is not automatically a qualified reviewer.
- Expired or inactive qualifications cannot satisfy a qualification requirement.
- Qualification evidence is preserved independently from the review outcome.
- Organizations configure required qualifications by domain, gate and review type.

## Production direction
Qualification records should be authenticated, periodically reviewed, protected from unauthorized changes and linked to the reviewer identity used in human-review and decision provenance records.
