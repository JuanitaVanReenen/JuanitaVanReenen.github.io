import crypto from 'node:crypto';

const sessions = new Map();

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
  if (!session) return res.status(401).json({ error: 'AUTH_REQUIRED' });
  req.userId = session.userId;
  req.sessionToken = token;
  next();
}
