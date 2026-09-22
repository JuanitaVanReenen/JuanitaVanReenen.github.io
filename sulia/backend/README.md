# Sulia Communication Core — v0.2

Sulia is being developed beyond a front-end messaging demonstration into a more transferable communication product foundation.

## Implemented in v0.2

- Conversation objects with explicit membership boundaries
- Identity registration with bearer-token authentication
- Authenticated sender identity (the API derives the sender from the token)
- Access control for conversations, events, reactions and read receipts
- Typed messages: text, voice and face
- Reply relationships between messages
- Delivery lifecycle: queued → delivered → read
- Message reactions
- Append-only conversation event history
- Idempotent message creation using a client message ID
- Input validation and bounded request/message sizes
- Basic per-client rate limiting
- Security-oriented HTTP response headers
- Atomic JSON persistence adapter for a durable reference deployment
- Deterministic Node.js test coverage

## API

### Identity
- POST /api/auth/register

### Conversations
- POST /api/conversations
- GET /api/conversations/:id
- GET /api/conversations/:id/events?after=N

### Messages
- POST /api/conversations/:id/messages
- POST /api/messages/:id/reactions
- POST /api/messages/:id/read

Authenticated endpoints use:

Authorization: Bearer <token>

## Persistence

The reference server persists its state through an atomic JSON file. The location can be configured with:

SULIA_DATA_FILE=/path/to/sulia.json

The runtime data directory is intentionally excluded from source control.

## Current boundary

This is a transferable reference backend, not a production messaging service. It does not claim production-grade authentication hardening, password/account recovery, encrypted media transport, media storage/CDN, push infrastructure, end-to-end encryption, moderation operations, horizontal scaling, observability infrastructure, or app-store deployment.

The purpose of this layer is to establish a concrete communication-domain model, identity boundary, access-control boundary, persistence mechanism and API surface that can be further productionised by a strategic acquirer or development team.

## Run

Node.js 22+

npm test
npm start
