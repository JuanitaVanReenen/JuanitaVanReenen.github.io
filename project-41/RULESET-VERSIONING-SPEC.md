# Ruleset Versioning Specification

## Purpose
Ensure every assurance assessment can identify the ruleset configuration that produced it.

## Principle
An assessment is not fully reproducible if the software cannot identify the rule configuration used at the time.

## Required metadata
- ruleset ID
- ruleset version
- effective timestamp
- domain
- jurisdiction/configuration where applicable
- rule definitions or immutable reference
- optional integrity checksum

## Controls
Changing a ruleset creates a new version. Existing gate packages retain their original ruleset reference.

## Human control
Ruleset versioning does not create approval authority. It provides reproducibility and audit context.

## Production direction
Production rulesets should be immutable, access-controlled, reviewed, tested and approved through the customer's governance process.
