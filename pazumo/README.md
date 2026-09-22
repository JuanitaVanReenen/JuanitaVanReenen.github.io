# PAZUMO

PAZUMO is a short-video social software platform and transferable technology asset.

## Product
A simple vertical short-video experience with creator publishing, follows, comments, sharing, downloads where permitted, expressive reactions, and a proprietary reaction-to-discovery signal layer.

## Core PAZUMO mechanism
PAZUMO reactions are stored as structured events. Each reaction has a defined discovery weight and is combined with watch, completion, replay, follow, share, comment and freshness signals. The resulting score is used by the feed-ranking service to order eligible videos.

The special PAZUMO Travel action is a structured distribution signal: it expresses that a viewer believes a video deserves broader discovery. It is not a payment, ad product, or guaranteed boost.

## Architecture
- Browser client: /pazumo/web
- API service: /pazumo/server
- Data model: /pazumo/server/schema.sql
- Core discovery logic: /pazumo/server/src/discovery.js
- Security/auth: /pazumo/server/src/auth.js
- API routes: /pazumo/server/src/app.js
- Tests: /pazumo/server/test
- Technical/IP specification: /pazumo/docs

## Production boundary
This repository contains a real, transferable application foundation and reference implementation. A production deployment still requires infrastructure-specific secrets, managed object storage/transcoding/CDN, distributed database/cache, observability, moderation operations, push notifications and mobile packaging.

## Ownership
PAZUMO is an independent software/product concept and technology asset developed by Juanita Van Reenen.
