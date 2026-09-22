# PAZUMO API Reference

## Health
GET /api/health

## Authentication
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout

## Feed
GET /api/feed

## Video publishing
POST /api/videos
Body: mediaUrl, caption, allowDownload

## Engagement
POST /api/videos/:videoId/view
POST /api/videos/:videoId/completion
POST /api/videos/:videoId/reactions
POST /api/videos/:videoId/share

Reaction values:
LOVE, FUNNY, WOW, CURIOUS, TRAVEL

## Download
GET /api/videos/:videoId/download

The endpoint checks publication status and creator download permission before returning the media location.

## Social
POST /api/users/:userId/follow
POST /api/videos/:videoId/comments

## Safety
POST /api/videos/:videoId/report
GET /api/notifications

Authenticated routes require an Authorization Bearer session token.
