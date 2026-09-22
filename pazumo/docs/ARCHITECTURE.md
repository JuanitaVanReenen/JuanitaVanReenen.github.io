# PAZUMO Architecture

## Services
1. API service — authentication, users, videos, follows, comments, reactions, notifications and feed.
2. Discovery service — candidate filtering and ranking.
3. Media boundary — provider-neutral media registration and download authorization.
4. Persistence — relational model for users, videos, follows, interactions and notifications.
5. Browser client — vertical feed and creator interaction interface.

## Security boundaries
Authentication tokens identify the user. Every mutation checks authorization. Video downloads check publication state and creator download permission. User-supplied text is validated and bounded. Rate limits apply to sensitive endpoints.

## Data flow
Client -> authenticated API -> authorization/validation -> service logic -> database -> response.

For feed requests:
Client -> feed endpoint -> candidate selection -> eligibility checks -> discovery scoring -> diversity pass -> ordered response.

## Production scaling boundary
The reference server is deployable as a conventional Node service. At production scale, media files should live in object storage, video processing should run asynchronously, playback should use CDN delivery, and ranking state may move to cache or feature-store infrastructure.
