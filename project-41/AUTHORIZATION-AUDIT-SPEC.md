# Authorization Audit Specification

## Purpose
Preserve a trace of security-relevant access and authorization decisions.

## Required event fields
- event ID
- authenticated actor ID
- tenant ID
- project ID
- action
- result
- reason where relevant
- timestamp

## Events
The model supports access granted/denied and decision-recording granted/denied events.

## Separation of concerns
Authorization audit events record who was permitted or denied an action. They do not alter requirement status, gate readiness or the human decision itself.

## Production requirements
Events should be append-only, access-controlled, time-synchronized and retained according to organizational and regulatory requirements.
