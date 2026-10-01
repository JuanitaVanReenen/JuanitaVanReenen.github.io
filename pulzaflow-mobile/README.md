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
- PULZA FLOW PLUS subscription architecture
- RevenueCat purchase/restore integration
- RevenueCat entitlement webhook
- Production database indexes and vote-integrity checks
- Mobile CI checks

## Required production configuration

The source code is prepared for production, but these external resources still have to be configured before store submission:

1. Production Supabase project and environment values.
2. `pulza-media` Storage bucket and Storage RLS policies.
3. Supabase Edge Function deployment and secrets.
4. Google AdMob account, production App IDs/ad units and consent configuration.
4. RevenueCat project, entitlement and products.
5. App Store Connect subscription products.
6. Google Play subscription products.
7. RevenueCat public API keys in the build environment.
8. Real-device iOS/Android QA and release builds.
9. Store listing, privacy/support URLs and final review materials.

Never put Supabase service-role keys or RevenueCat secret keys in the mobile app.

## Important status

The repository contains the production implementation and configuration scaffolding. It is **not yet an App Store/Google Play release** until the external services above are connected and the release builds pass device/store testing.
