# PULZA FLOW — Moderation admin specification

## Purpose

The production service needs a private moderator/admin interface. End users must never receive access to the moderation queue.

## Queue

Moderators need to see:
- report ID
- created time
- report reason
- reported Pulza/user
- reporter
- current status
- previous moderation actions

## Actions

A moderator can:
- mark a report reviewing
- resolve a report
- dismiss a report
- remove violating content
- restrict or suspend an abusive account
- document an internal moderation note

## Security

- Moderator access must be based on server-side roles, not a client-side flag.
- End users cannot read other users' reports.
- Service-role credentials remain server-side.
- Every moderation action should be auditable.
- The moderator UI should require authenticated staff access.

## Database additions required

A future migration should add:
- moderator/admin role mapping
- moderation action/audit table
- optional account suspension fields
- content removal state

Do not expose the reports table as a public admin API.

## Release gate

The social app should not be submitted as production-ready until there is an operational process for reviewing reports and taking appropriate action. Apple requires UGC apps to provide reporting, timely responses, blocking and published contact information; Google Play requires robust ongoing UGC moderation and accessible reporting/blocking. 
