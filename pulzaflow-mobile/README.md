# PULZA FLOW — Production Mobile App

PULZA FLOW is a separate iOS + Android application codebase. It does not replace the existing web demo and does not touch VANTARA or any other portfolio project.

## Current build

- Email/password authentication
- No government-ID requirement for ordinary signup
- Terms + Community Guidelines acceptance
- Persistent Supabase social data model with RLS
- Posts and Pulzas
- Reactions, comments and voting
- Media upload/storage architecture
- Notifications and realtime foundation
- Report/block moderation controls
- Account deletion Edge Function
- Production database indexes and vote-integrity checks
- Mobile CI checks
- Advertising integration for the free app

## Monetization

The Google Play version is **free with advertising only**. There are no in-app purchases or subscriptions.

## Required production configuration

The following external resources still need to be configured and verified before store submission:

1. Production Supabase project and environment values.
2. `pulza-media` Storage bucket and Storage RLS policies.
3. Supabase Edge Function deployment and secrets.
4. Google AdMob account, production App IDs/ad units and consent configuration.
5. Real-device iOS/Android QA and release builds.
6. Store listing, privacy/support URLs and final review materials.

Never put Supabase service-role keys or other private server secrets in the mobile app.

## Important status

The repository contains the production mobile implementation and configuration scaffolding. The Google Play release still requires the production Android App Bundle to be built, tested on a real Android device, uploaded to Play Console, and run through Google's required testing workflow.
