# PAZUMO API Reference

## Public
GET /api/health

## Authentication
POST /api/auth/register
POST /api/auth/logout

## Feed
GET /api/feed

## Videos
POST /api/videos

## Reactions
POST /api/videos/:videoId/reactions
Body: {"type":"LOVE|FUNNY|WOW|CURIOUS|TRAVEL"}

## Social
POST /api/users/:userId/follow
POST /api/videos/:videoId/comments
GET /api/notifications

Authenticated routes require an Authorization Bearer session token.
