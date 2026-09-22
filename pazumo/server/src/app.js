import http from 'node:http';
import { URL } from 'node:url';
import { createStore } from './store.js';
import { issueSession, revokeSession, requireAuth, hashPassword, verifyPassword } from './auth.js';
import { rankVideos } from './discovery.js';

const store = createStore();
const PORT = Number(process.env.PORT || 8787);

function json(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'referrer-policy': 'no-referrer',
    'content-length': Buffer.byteLength(data)
  });
  res.end(data);
}

function readBody(req, limit = 128 * 1024) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (Buffer.byteLength(data) > limit) reject(Object.assign(new Error('BODY_TOO_LARGE'), { status: 413 }));
    });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch { reject(Object.assign(new Error('INVALID_JSON'), { status: 400 })); }
    });
    req.on('error', reject);
  });
}

function validText(value, max) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}

const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 120;
const rateBuckets = new Map();

function clientKey(req) {
  return String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
}

function rateLimited(req) {
  const now = Date.now();
  const key = clientKey(req);
  const bucket = rateBuckets.get(key) || { start: now, count: 0 };
  if (now - bucket.start >= RATE_WINDOW_MS) {
    bucket.start = now;
    bucket.count = 0;
  }
  bucket.count++;
  rateBuckets.set(key, bucket);
  return bucket.count > RATE_LIMIT;
}

function safeUser(user) {
  if (!user) return null;
  const { passwordHash, email, ...publicUser } = user;
  return publicUser;
}

function route(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;

  if (req.method === 'GET' && path === '/api/health') {
    return json(res, 200, { ok: true, service: 'pazumo-api', version: '1.1.0' });
  }

  if (req.method === 'POST' && path === '/api/auth/register') {
    return readBody(req).then(async body => {
      if (!validText(body.username, 40) || !validText(body.email, 160) || !validText(body.password, 72) || body.password.length < 8) {
        return json(res, 400, { error: 'INVALID_REGISTRATION' });
      }
      if ([...store.users.values()].some(u => u.email.toLowerCase() === body.email.toLowerCase())) {
        return json(res, 409, { error: 'EMAIL_EXISTS' });
      }
      const userId = store.id('usr');
      const passwordHash = await hashPassword(body.password);
      store.users.set(userId, {
        id: userId,
        username: body.username.trim(),
        email: body.email.trim().toLowerCase(),
        passwordHash,
        createdAt: new Date().toISOString()
      });
      store.notifications.set(userId, []);
      const token = issueSession(userId);
      return json(res, 201, { user: safeUser(store.users.get(userId)), token });
    }).catch(err => json(res, err.status || 500, { error: err.message }));
  }

  if (req.method === 'POST' && path === '/api/auth/login') {
    return readBody(req).then(async body => {
      const user = [...store.users.values()].find(u => u.email === String(body.email || '').toLowerCase());
      if (!user || !(await verifyPassword(String(body.password || ''), user.passwordHash))) {
        return json(res, 401, { error: 'INVALID_CREDENTIALS' });
      }
      return json(res, 200, { user: safeUser(user), token: issueSession(user.id) });
    }).catch(err => json(res, err.status || 500, { error: err.message }));
  }

  if (req.method === 'POST' && path === '/api/auth/logout') {
    return requireAuth(req, res, () => {
      revokeSession(req.sessionToken);
      json(res, 200, { ok: true });
    });
  }

  if (req.method === 'GET' && path === '/api/feed') {
    return requireAuth(req, res, () => {
      const following = new Set([...store.follows]
        .filter(k => k.startsWith(req.userId + ':'))
        .map(k => k.split(':')[1]));
      const ranked = rankVideos([...store.videos.values()], req.userId, { following });
      json(res, 200, { items: ranked.slice(0, 50) });
    });
  }

  if (req.method === 'POST' && path === '/api/videos') {
    return requireAuth(req, res, () => readBody(req).then(body => {
      if (body.caption !== '' && body.caption !== undefined && !validText(body.caption, 2200)) {
        return json(res, 400, { error: 'INVALID_CAPTION' });
      }
      if (!validText(body.mediaUrl, 2048)) return json(res, 400, { error: 'INVALID_MEDIA_URL' });
      const videoId = store.id('vid');
      const video = {
        id: videoId,
        creatorId: req.userId,
        caption: body.caption || '',
        mediaUrl: body.mediaUrl,
        status: 'PUBLISHED',
        allowDownload: body.allowDownload === true,
        createdAt: new Date().toISOString(),
        reactions: {},
        avgCompletion: 0,
        replayRate: 0,
        shareCount: 0,
        commentCount: 0,
        followCount: 0,
        downloadCount: 0,
        reportCount: 0
      };
      store.videos.set(videoId, video);
      store.addEvent({ type: 'VIDEO_PUBLISHED', userId: req.userId, videoId });
      return json(res, 201, video);
    }).catch(err => json(res, err.status || 500, { error: err.message })));
  }

  const viewMatch = path.match(/^\/api\/videos\/([^/]+)\/view$/);
  if (req.method === 'POST' && viewMatch) {
    return requireAuth(req, res, () => {
      const video = store.videos.get(viewMatch[1]);
      if (!video || video.status !== 'PUBLISHED') return json(res, 404, { error: 'VIDEO_NOT_FOUND' });
      store.addEvent({ type: 'VIEW', userId: req.userId, videoId: video.id });
      return json(res, 200, { ok: true });
    });
  }

  const completionMatch = path.match(/^\/api\/videos\/([^/]+)\/completion$/);
  if (req.method === 'POST' && completionMatch) {
    return requireAuth(req, res, () => readBody(req).then(body => {
      const video = store.videos.get(completionMatch[1]);
      const completion = Number(body.completion);
      if (!video || video.status !== 'PUBLISHED') return json(res, 404, { error: 'VIDEO_NOT_FOUND' });
      if (!Number.isFinite(completion) || completion < 0 || completion > 1) return json(res, 400, { error: 'INVALID_COMPLETION' });
      video.avgCompletion = video.avgCompletion === 0 ? completion : (video.avgCompletion * 0.8) + (completion * 0.2);
      store.addEvent({ type: 'COMPLETION', userId: req.userId, videoId: video.id, value: completion });
      return json(res, 200, { ok: true });
    }).catch(err => json(res, err.status || 500, { error: err.message })));
  }

  const reactionMatch = path.match(/^\/api\/videos\/([^/]+)\/reactions$/);
  if (req.method === 'POST' && reactionMatch) {
    return requireAuth(req, res, () => readBody(req).then(body => {
      const video = store.videos.get(reactionMatch[1]);
      const allowed = ['LOVE','FUNNY','WOW','CURIOUS','TRAVEL'];
      if (!video || video.status !== 'PUBLISHED') return json(res, 404, { error: 'VIDEO_NOT_FOUND' });
      if (!allowed.includes(body.type)) return json(res, 400, { error: 'INVALID_REACTION' });
      const key = req.userId + ':' + video.id;
      const prior = store.reactions.get(key);
      if (prior) video.reactions[prior] = Math.max(0, (video.reactions[prior] || 1) - 1);
      video.reactions[body.type] = (video.reactions[body.type] || 0) + 1;
      store.reactions.set(key, body.type);
      store.addEvent({ type: 'REACTION', userId: req.userId, videoId: video.id, reaction: body.type });
      return json(res, 200, { ok: true, reaction: body.type, discoverySignal: body.type === 'TRAVEL' });
    }).catch(err => json(res, err.status || 500, { error: err.message })));
  }

  const shareMatch = path.match(/^\/api\/videos\/([^/]+)\/share$/);
  if (req.method === 'POST' && shareMatch) {
    return requireAuth(req, res, () => {
      const video = store.videos.get(shareMatch[1]);
      if (!video || video.status !== 'PUBLISHED') return json(res, 404, { error: 'VIDEO_NOT_FOUND' });
      video.shareCount++;
      store.addEvent({ type: 'SHARE', userId: req.userId, videoId: video.id });
      return json(res, 200, { ok: true });
    });
  }

  const downloadMatch = path.match(/^\/api\/videos\/([^/]+)\/download$/);
  if (req.method === 'GET' && downloadMatch) {
    return requireAuth(req, res, () => {
      const video = store.videos.get(downloadMatch[1]);
      if (!video || video.status !== 'PUBLISHED') return json(res, 404, { error: 'VIDEO_NOT_FOUND' });
      if (!video.allowDownload && video.creatorId !== req.userId) return json(res, 403, { error: 'DOWNLOAD_DISABLED' });
      video.downloadCount++;
      store.addEvent({ type: 'DOWNLOAD', userId: req.userId, videoId: video.id });
      return json(res, 200, { allowed: true, mediaUrl: video.mediaUrl });
    });
  }

  const followMatch = path.match(/^\/api\/users\/([^/]+)\/follow$/);
  if (req.method === 'POST' && followMatch) {
    return requireAuth(req, res, () => {
      if (followMatch[1] === req.userId) return json(res, 400, { error: 'SELF_FOLLOW' });
      const target = store.users.get(followMatch[1]);
      if (!target) return json(res, 404, { error: 'USER_NOT_FOUND' });
      store.follows.add(req.userId + ':' + target.id);
      for (const v of store.videos.values()) if (v.creatorId === target.id) v.followCount++;
      store.addEvent({ type: 'FOLLOW', userId: req.userId, targetUserId: target.id });
      return json(res, 200, { ok: true });
    });
  }

  const commentMatch = path.match(/^\/api\/videos\/([^/]+)\/comments$/);
  if (req.method === 'POST' && commentMatch) {
    return requireAuth(req, res, () => readBody(req).then(body => {
      const video = store.videos.get(commentMatch[1]);
      if (!video || video.status !== 'PUBLISHED') return json(res, 404, { error: 'VIDEO_NOT_FOUND' });
      if (!validText(body.text, 500)) return json(res, 400, { error: 'INVALID_COMMENT' });
      const comment = { id: store.id('com'), videoId: video.id, userId: req.userId, text: body.text.trim(), createdAt: new Date().toISOString() };
      if (!store.comments.has(video.id)) store.comments.set(video.id, []);
      store.comments.get(video.id).push(comment);
      video.commentCount++;
      store.addEvent({ type: 'COMMENT', userId: req.userId, videoId: video.id });
      return json(res, 201, comment);
    }).catch(err => json(res, err.status || 500, { error: err.message })));
  }

  const reportMatch = path.match(/^\/api\/videos\/([^/]+)\/report$/);
  if (req.method === 'POST' && reportMatch) {
    return requireAuth(req, res, () => readBody(req).then(body => {
      const video = store.videos.get(reportMatch[1]);
      if (!video || video.status !== 'PUBLISHED') return json(res, 404, { error: 'VIDEO_NOT_FOUND' });
      const reason = validText(body.reason || 'OTHER', 100) ? String(body.reason || 'OTHER').trim() : 'OTHER';
      video.reportCount++;
      store.addEvent({ type: 'REPORT', userId: req.userId, videoId: video.id, reason });
      return json(res, 202, { accepted: true });
    }).catch(err => json(res, err.status || 500, { error: err.message })));
  }

  if (req.method === 'GET' && path === '/api/notifications') {
    return requireAuth(req, res, () => json(res, 200, { items: store.notifications.get(req.userId) || [] }));
  }

  json(res, 404, { error: 'NOT_FOUND' });
}

const server = http.createServer((req, res) => {
  if (rateLimited(req)) return json(res, 429, { error: 'RATE_LIMITED' });
  try { route(req, res); }
  catch { json(res, 500, { error: 'INTERNAL_ERROR' }); }
});

if (process.argv[1] && process.argv[1].endsWith('app.js')) {
  server.listen(PORT, () => console.log('PAZUMO API listening on ' + PORT));
}

export { server, store };
