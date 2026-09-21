# Sulia Communication Core — v0.1

This package takes Sulia beyond a front-end-only messaging demonstration by defining a transferable backend/reference architecture for the communication layer.

## Implemented
- Conversation objects with membership boundaries
- Typed messages: text, voice, face
- Reply relationships between messages
- Delivery lifecycle: queued → delivered → read
- Message reactions
- Append-only conversation event history
- Idempotent message creation using a client message ID
- HTTP API surface for conversations, messages, reactions, reads and event history
- Deterministic Node.js test coverage

## API
- POST /api/conversations
- GET /api/conversations/:id
- POST /api/conversations/:id/messages
- GET /api/conversations/:id/events?after=N
- POST /api/messages/:id/reactions
- POST /api/messages/:id/read

## Current boundary
This is a transferable reference backend, not a production deployment. It uses an in-memory store in the reference server and deliberately does not claim production authentication, media storage, push infrastructure, encryption, moderation, scaling or app-store deployment.

The purpose is to establish a real communication-domain model and API boundary that a strategic acquirer could productionise.

## Run
npm test
npm start
