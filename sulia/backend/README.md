# Sulia Communication Core — v0.4

Sulia is being developed beyond a front-end messaging demonstration into a more transferable communication product foundation.

## Implemented in v0.3

- Conversation objects with explicit membership boundaries
- Identity registration with bearer-token authentication\n- Expiring sessions and explicit token revocation
- Authenticated sender identity
- Access control for conversations, events, reactions and read receipts
- Typed messages: text, voice and face
- Media references for voice/Face messages
- Reply relationships between messages
- Delivery lifecycle: queued → delivered → read
- Message reactions
- Append-only conversation event history
- Idempotent message creation using a client message ID
- Input validation and bounded request/message sizes
- Basic per-client rate limiting
- Security-oriented HTTP response headers
- Atomic JSON persistence for core, identity, notification and media metadata state
- Local media storage foundation with allow-listed media types and bounded size
- Server-sent event (SSE) realtime delivery for conversation events
- Per-user notification queue with unread/read state
- Deterministic Node.js unit and end-to-end HTTP API test coverage
- CI archive of the tested backend source

## API

### Identity
- POST /api/auth/register\n- POST /api/auth/revoke

### Media
- POST /api/media
  - authenticated binary upload
  - content type must be one of the supported audio/video/image types
  - default maximum: 25 MB
  - returns a media ID that can be referenced by a voice or Face message; media references are owner-checked at message creation

### Conversations
- POST /api/conversations
- GET /api/conversations/:id
- GET /api/conversations/:id/events?after=N
- GET /api/conversations/:id/stream

The stream endpoint uses Server-Sent Events for the reference realtime layer.

### Messages
- POST /api/conversations/:id/messages
- POST /api/messages/:id/reactions
- POST /api/messages/:id/read

### Notifications
- GET /api/notifications
- GET /api/notifications?unread=1
- POST /api/notifications/:id/read

Authenticated endpoints use:

Authorization: Bearer <token>

## Persistence

The reference server persists core state through an atomic JSON file. The location can be configured with:

SULIA_DATA_FILE=/path/to/sulia.json

Media files use:

SULIA_MEDIA_DIR=/path/to/media

The runtime data directory is intentionally excluded from source control. Media metadata is persisted separately from the binary media files.

## Verification\n\n`npm test` runs both the core unit suite and an end-to-end HTTP API suite covering authentication, access control, media ownership, notifications, persistence boundaries and token revocation.\n\n## Current boundary

This is a transferable reference backend, not a production messaging service. It does **not** claim production-grade account recovery, credential/password security, encrypted media transport, end-to-end encryption, object-storage/CDN integration, push-notification infrastructure, moderation operations, horizontal scaling, distributed concurrency control, production observability, or app-store deployment.

The media and realtime layers are concrete reference implementations that establish interfaces and control boundaries. A production deployment would replace or harden these components for its infrastructure and threat model.

## Run

Node.js 22+

npm test
npm start
