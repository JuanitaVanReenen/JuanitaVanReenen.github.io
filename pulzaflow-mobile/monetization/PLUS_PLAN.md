# PULZA FLOW PLUS

PULZA FLOW remains free to download and use.

PLUS is the optional premium subscription layer for users who want additional creator and participation features.

## Initial commercial structure

- 7-day introductory trial, subject to App Store / Google Play offer configuration.
- Monthly subscription.
- Annual subscription.
- One application entitlement: plus.
- Free users retain the core social experience.

## Initial PLUS feature candidates

- Enhanced Pulza creation tools.
- Additional creator controls.
- Expanded profile customization.
- Advanced participation insights.
- Premium discovery/customization tools.
- Future creator/business features as the audience grows.

Premium features must provide continuing value. Apple describes auto-renewable subscriptions as access to ongoing content, services, or premium features. Google Play likewise treats subscriptions as recurring transactions that grant defined entitlements.

## Product identifiers

- iOS monthly: com.pulzaflow.plus.monthly
- iOS annual: com.pulzaflow.plus.annual
- Android subscription: pulza_flow_plus

Final store products must be created in App Store Connect and Google Play Console.

## Trial

The app must display trial terms clearly before purchase. The actual introductory/free-trial offer is configured in the relevant store; the app must not pretend a trial is active until the store transaction confirms the entitlement.

## Server entitlement

The subscriptions table is the application's entitlement record. Store purchase events should update server-side entitlement. The client should use that entitlement rather than trusting a local boolean.

## Separation

PULZA FLOW monetization belongs only to PULZA FLOW.
