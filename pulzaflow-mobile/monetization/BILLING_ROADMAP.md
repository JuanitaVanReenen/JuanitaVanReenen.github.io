# PULZA FLOW — Store billing implementation roadmap

## Apple
Use StoreKit 2 for the iOS purchase layer. The app should load the two configured product IDs, present the monthly and annual options, start the purchase, verify the transaction, and finish the transaction. The server entitlement remains the application's access record.

Use Apple's current-entitlement APIs for local entitlement refresh and App Store Server Notifications V2 / App Store Server API for server lifecycle synchronization.

## Google Play
Use a currently supported Google Play Billing Library release. Configure the `pulza_flow_plus` subscription with its base plan and introductory offer in Play Console. Purchase tokens must be verified server-side, with the backend treating the Google Play Developer API subscription state as the source of truth.

## Required server synchronization
Apple event -> verify -> update subscriptions row.
Google event -> verify -> update subscriptions row.

The client never writes `plan=plus` merely because a purchase button was tapped.

## Required states
- free
- trialing
- active
- cancelled but still entitled until period end
- past_due / grace period where applicable
- expired

## Required tests
- first purchase
- successful renewal
- cancellation
- expiration
- billing failure/recovery
- restore
- device/account change
- introductory offer eligibility
- duplicate event handling

No production purchase flow is considered complete until store-side products, server verification, entitlement synchronization and lifecycle tests have all passed.
