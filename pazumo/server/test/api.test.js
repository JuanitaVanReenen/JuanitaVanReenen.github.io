import test from 'node:test';
import assert from 'node:assert/strict';
import { server } from '../src/app.js';

test('health endpoint is available', async () => {
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const res = await fetch('http://127.0.0.1:' + port + '/api/health');
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.ok, true);
  await new Promise(resolve => server.close(resolve));
});
