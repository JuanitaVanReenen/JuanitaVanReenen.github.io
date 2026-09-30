# PULZA FLOW — UGC acceptance flow

## Requirement

A user must accept the current Terms of Use and Community Guidelines before the app allows that user to create or upload a Post, Pulza, comment, or media.

Google Play's current UGC policy explicitly requires acceptance of the Terms/User Policy before creating or uploading UGC.

## Product flow

1. User signs in.
2. App checks the user's policy-acceptance state.
3. If acceptance is missing or an older policy version is required, show the acceptance screen.
4. Display links to Terms of Use and Community Guidelines.
5. User actively checks the acceptance control.
6. User taps Continue.
7. Server records the accepted policy versions and timestamp.
8. Only then are create/upload actions enabled.

## Database requirement

Add a future migration with a table such as:

policy_acceptances(
  user_id,
  terms_version,
  guidelines_version,
  accepted_at,
  primary key(user_id, terms_version, guidelines_version)
)

The server should treat the recorded acceptance as authoritative.

## Re-acceptance

When material Terms or Community Guidelines changes require renewed consent, the user must accept the new versions before creating/uploading UGC again.

## Privacy separation

The Privacy Policy is separate from the Terms of Use and Community Guidelines. The acceptance UI should make that distinction clear.

## Release gate

Do not submit the production UGC build until the acceptance state is enforced server-side and the complete flow has been tested for new accounts, existing accounts, policy updates and rejected acceptance.
