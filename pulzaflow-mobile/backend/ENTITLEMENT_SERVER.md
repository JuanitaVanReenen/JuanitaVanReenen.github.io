# PULZA FLOW — Server-side subscription entitlement

## Principle

The mobile client must never grant PLUS solely from a local purchase flag.

The authoritative application record is:

`public.subscriptions`

with:
- user_id
- plan
- status
- store
- product_id
- trial_ends_at
- current_period_ends_at
- updated_at

## Apple flow

1. App starts a StoreKit purchase.
2. Apple returns a transaction.
3. The transaction is verified.
4. The verified transaction identifier / original transaction identifier is sent to the protected backend.
5. Backend verifies the transaction/subscription state using Apple's server APIs.
6. Backend maps the verified product to the PULZA FLOW user.
7. Backend updates `subscriptions`.
8. App refreshes its entitlement.

## Google flow

1. App starts Google Play Billing.
2. Google returns a purchase token.
3. The purchase token is sent to the protected backend.
4. Backend verifies the subscription with the Google Play Developer API.
5. Backend maps the verified product to the PULZA FLOW user.
6. Backend updates `subscriptions`.
7. App refreshes its entitlement.

## Security rules

- Never put Apple private keys, App Store Connect API keys, Google service-account credentials or Supabase service-role keys in the mobile bundle.
- Verify purchases server-side.
- Make entitlement updates idempotent.
- Do not trust price, product, expiry or trial claims supplied only by the client.
- Keep an audit trail of store event identifiers where practical.
- Handle cancellation and expiry without immediately revoking access before the actual entitlement period ends.

## Deployment

The verification endpoints should be Supabase Edge Functions or another authenticated backend service. Secrets must be stored as server-side secrets.

This file is an implementation specification. It does not claim that Apple/Google verification is live yet.
