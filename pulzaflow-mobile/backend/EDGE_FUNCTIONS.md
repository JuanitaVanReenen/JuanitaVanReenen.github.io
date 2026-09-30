# PULZA FLOW — Account deletion

The mobile app must never contain a Supabase service-role or secret key.

Create a protected Supabase Edge Function named `delete-account`. It should:

1. Require an authenticated user JWT.
2. Determine the caller's user ID from the verified auth context.
3. Remove that user's Storage objects before Auth deletion when applicable.
4. Call the server-side Auth admin delete operation for that same user ID.
5. Return a clear success/error response.
6. Keep the service-role/secret key only in Supabase server-side secrets.

Supabase's current documentation states that Auth admin user deletion requires a service-role key and must only be performed server-side. It also notes that users who own Storage objects must have those objects removed before the Auth user can be deleted.

This repository intentionally contains only the mobile client invocation and deployment requirements, not a secret key.
