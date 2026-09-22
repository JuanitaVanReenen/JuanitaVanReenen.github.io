import test from 'node:test';
import assert from 'node:assert/strict';
import { server, store } from '../src/app.js';

async function request(port, path, options = {}) {
  return fetch('http://127.0.0.1:' + port + path, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options.headers || {}) }
  });
}

test('health endpoint is available', async () => {
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const res = await request(port, '/api/health');
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.ok, true);
  await new Promise(resolve => server.close(resolve));
  store.users.clear();
  store.videos.clear();
  store.follows.clear();
  store.blocks.clear();
  store.events.length = 0;
});

test('registration does not expose password hash and login works', async () => {
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const email = 'test-' + Date.now() + '@example.com';
  const reg = await request(port, '/api/auth/register', {
    method:'POST',
    body: JSON.stringify({username:'tester',email,password:'strong-pass-123'})
  });
  assert.equal(reg.status, 201);
  const rb = await reg.json();
  assert.ok(rb.token);
  assert.equal(rb.user.passwordHash, undefined);

  const login = await request(port, '/api/auth/login', {
    method:'POST',
    body: JSON.stringify({email,password:'strong-pass-123'})
  });
  assert.equal(login.status, 200);
  const lb = await login.json();
  assert.ok(lb.token);
  assert.equal(lb.user.passwordHash, undefined);

  const bad = await request(port, '/api/auth/login', {
    method:'POST',
    body: JSON.stringify({email,password:'wrong'})
  });
  assert.equal(bad.status, 401);

  await new Promise(resolve => server.close(resolve));
  store.users.clear();
  store.notifications.clear();
});

test('protected feed requires authentication', async () => {
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const res = await request(port, '/api/feed');
  assert.equal(res.status, 401);
  await new Promise(resolve => server.close(resolve));
});