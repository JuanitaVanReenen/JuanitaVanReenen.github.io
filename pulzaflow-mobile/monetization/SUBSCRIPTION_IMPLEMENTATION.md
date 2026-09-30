# PULZA FLOW PLUS — production billing architecture

## Products

- iOS monthly: `com.pulzaflow.plus.monthly`
- iOS annual: `com.pulzaflow.plus.annual`
- Android subscription: `pulza_flow_plus`

The product IDs are placeholders until the products are actually created in App Store Connect and Google Play Console.

## Entitlement model

The client must not decide Plus access from a local boolean. Store transactions must be verified and the server-side `subscriptions` row is the application's entitlement record.

Required server fields:
- user_id
- plan
- status
- store
- product_id
- trial_ends_at
- current_period_ends_at
- updated_at

## Apple

Use StoreKit for purchase and transaction handling. Configure the monthly and annual products in one subscription group. Configure any introductory offer in App Store Connect. Use App Store Server Notifications and/or the App Store Server API to keep server entitlement current.

## Google Play

Use Google Play Billing for the subscription. Configure the subscription product, base plan and any introductory offer in Play Console. Verify purchases server-side and keep the application's entitlement synchronized with Play lifecycle events.

## Restore / manage

The app should provide a visible subscription-management path and restore/sync entitlement state on account sign-in.

## Testing

Do not present a real purchase button as production-ready until:
1. Store products exist.
2. Test accounts are configured.
3. Purchase verification works.
4. Renewal/cancellation/expiry paths have been tested.
5. Server entitlement updates have been tested.
6. The Plus feature gates have been tested.

Apple documents StoreKit subscription handling and server notifications; Google documents subscription lifecycle management through Play Billing.
