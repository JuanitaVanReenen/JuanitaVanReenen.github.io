# Requirement Sufficiency Specification

## Purpose
Connect evidence quality to requirement-specific sufficiency thresholds.

## Principle
Different requirements may require different evidence strength. A single global evidence threshold is not sufficient for all engineering, environmental, commercial or regulatory requirements.

## Rule
Each requirement may define a minimum evidence quality:
- insufficient
- weak
- adequate
- strong

Evidence that meets the configured threshold can support the requirement, but does not automatically approve it.

## Output
The engine reports:
- evidence count
- qualifying evidence count
- support status
- mandatory human review indicator

## Production direction
Thresholds must be configurable by domain, requirement type, jurisdiction and gate, with governed ruleset versions and authorized human review.
