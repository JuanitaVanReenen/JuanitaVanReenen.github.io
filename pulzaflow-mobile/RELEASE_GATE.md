# PULZA FLOW — Release Gate

## Completed in the repository
- Email/password authentication; no government-ID requirement for ordinary signup.
- Policy acceptance gate for Terms and Community Guidelines.
- Real Supabase feed, posts and Pulzas.
- Reactions, comments, voting, follows, profiles and profile photos.
- Media upload and signed media playback.
- Notifications and realtime foundations.
- Report/block controls.
- Account deletion client flow and server Edge Function.
- Server-side moderator role enforcement and auditable moderation actions.
- RevenueCat purchase/restore client integration and lifecycle webhook.
- Public privacy, terms, community-guidelines, support and account-deletion pages.
- Expo SDK 57 dependency alignment.
- GitHub Actions mobile validation.

## External production work required before store submission
1. Create/configure the production Supabase project.
2. Apply `backend/schema.sql` and configure `pulza-media` storage/RLS.
3. Deploy `delete-account`, `revenuecat-webhook`, and `moderation-admin` Edge Functions.
4. Set server secrets: Supabase service role and RevenueCat webhook authorization.
5. Create RevenueCat apps, entitlement `pulza_flow_plus`, monthly/annual products and store connections.
6. Create matching App Store and Google Play subscription products.
7. Set RevenueCat public SDK keys as EAS build environment variables.
8. Create the Apple Developer and Google Play developer accounts and signing credentials.
9. Replace/confirm the public support contact on the support page and store listings.
10. Perform real-device QA for signup, policy acceptance, posting, media, voting, comments, follows, notifications, reports, blocks, deletion and purchases.
11. Produce final store icon, screenshots, descriptions, privacy/data-safety declarations and release notes.
12. Run production EAS builds and upload to TestFlight / Google Play internal testing before public release.

## Public pages
- https://juanitavanreenen.github.io/pulzaflow-public/privacy.html
- https://juanitavanreenen.github.io/pulzaflow-public/terms.html
- https://juanitavanreenen.github.io/pulzaflow-public/community-guidelines.html
- https://juanitavanreenen.github.io/pulzaflow-public/support.html
- https://juanitavanreenen.github.io/pulzaflow-public/delete-account.html

Do not submit the app until the external configuration and real-device/store testing above are completed.
