import { createHmac } from 'node:crypto';

/** Signs synthetic claims independently of the application's JWT implementation. */
export function fixtureToken(claims: Record<string, unknown>, secret: string) {
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
  ).toString('base64url');
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  const signature = createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
}
