import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { expect, test } from '@playwright/test';

test('development backend serves API without frontend assets', async ({
  request,
}) => {
  const probe = createServer();
  await new Promise<void>((resolve, reject) => {
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', resolve);
  });
  const address = probe.address();
  if (!address || typeof address === 'string') {
    throw new Error('Unable to allocate a test port');
  }
  const port = address.port;
  await new Promise<void>((resolve, reject) =>
    probe.close((error) => (error ? reject(error) : resolve())),
  );
  const child = spawn(
    'bun',
    ['--no-env-file', 'apps/server/src/dev/index.ts'],
    {
      env: { ...process.env, PORT: String(port) },
      stdio: 'ignore',
    },
  );
  const origin = `http://127.0.0.1:${port}`;
  try {
    await expect
      .poll(async () => {
        try {
          return (await request.get(`${origin}/api/health`)).status();
        } catch {
          return 0;
        }
      })
      .toBe(200);
    expect((await request.get(`${origin}/`)).status()).toBe(404);
    expect((await request.get(`${origin}/login`)).status()).toBe(404);
    expect((await request.get(`${origin}/assets/index.js`)).status()).toBe(404);
    expect((await request.get(`${origin}/api/missing`)).status()).toBe(404);
  } finally {
    child.kill();
  }
});
