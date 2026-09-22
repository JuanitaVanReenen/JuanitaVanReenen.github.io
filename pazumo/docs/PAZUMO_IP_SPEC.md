# PAZUMO — Proprietary Software/IP Specification

## 1. Asset definition
PAZUMO is a short-video social platform comprising source code, data structures, API contracts, user interaction logic, feed/discovery logic, reaction taxonomy, technical documentation and implementation know-how.

## 2. Core user model
Users can create an account and profile, publish short videos, follow creators, watch a vertical feed, react, comment and share, download videos when creator permission allows, receive notifications, report content and manage blocked users.

Creators can publish and manage videos, choose download permission, see basic engagement statistics and receive structured reaction signals.

## 3. Reaction taxonomy
PAZUMO uses:
- LOVE — positive affinity
- FUNNY — humorous response
- WOW — high-impact response
- CURIOUS — interest/exploration response
- TRAVEL — the distinctive PAZUMO discovery action

TRAVEL is deliberately modeled as a community-discovery signal, not as a paid promotion mechanism.

## 4. Discovery mechanism
Every qualifying interaction becomes an event. The discovery service aggregates recent interaction quality, completion, replay, follows, comments, shares, reaction types, freshness and creator diversity.

The ranking model is deterministic and inspectable in the reference implementation. It is designed so a buyer can replace or extend components with learned ranking, experimentation infrastructure or large-scale feature stores.

## 5. Trust and safety
The system includes authentication, authorization, ownership checks, validation, bounded payloads, rate limiting, reporting and moderation states. Download authorization is checked against creator settings.

## 6. Video lifecycle
upload request -> authorization -> validation -> media registration -> processing state -> publish -> feed eligibility -> playback/download authorization -> engagement events.

The reference implementation keeps media processing provider-neutral so production infrastructure can be selected by an acquiring company.

## 7. Transferable components
The buyer receives the source implementation, schema, tests, API contract, architecture notes, IP specification and deployment guidance. Production credentials and third-party infrastructure accounts are intentionally not embedded.

## 8. Expansion points
Potential future buyer-led additions include native iOS/Android packaging, production video transcoding, CDN delivery, advanced ML ranking, push notifications, creator analytics, moderation automation, advertising, subscriptions and commerce. These are expansion paths, not dependencies of the core asset.
