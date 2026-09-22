import crypto from 'node:crypto';

const sessions = new Map();

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derived) => {
      if (err) return reject(err);
      resolve('scrypt$' + salt.toString('hex') + '$' + derived.toString('hex'));
    });
  });
}

export async function verifyPassword(password, stored) {
  const parts = String(stored).split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const salt = Buffer.from(parts[1], 'hex');
  const expected = Buffer.from(parts[2], 'hex');
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, expected.length, (err, derived) => {
      if (err) return reject(err);
      resolve(crypto.timingSafeEqual(expected, derived));
    });
  });
}

export function issueSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { userId, createdAt: Date.now() });
  return token;
}

export function revokeSession(token) {
  sessions.delete(token);
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const session = token ? sessions.get(token) : null;
  if (!session) {
    const body = JSON.stringify({ error: 'AUTH_REQUIRED' });
    res.writeHead(401, {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
      'content-length': Buffer.byteLength(body)
    });
    res.end(body);
    return;
  }
  req.userId = session.userId;
  req.sessionToken = token;
  next();
}