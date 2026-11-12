import { loginSchema } from '@credit/contracts';
import type { AppType } from '@credit/server/app';
import { sessionSchema } from '@web/constant/schema';
import type { Session } from '@web/constant/type';
import { type LoginInput, slugListSchema } from '@web/features/auth/auth.type';
import { hc } from 'hono/client';

const client = hc<AppType>(window.location.origin);
export async function getSlugs() {
  const response = await client.api.user.slugs.$get();
  if (!response.ok) {
    throw new Error('Gagal memuat perusahaan');
  }
  return slugListSchema.parse(await response.json());
}
export async function signIn(input: LoginInput): Promise<Session> {
  const payload = loginSchema.parse(input);
  const response = await client.api.login.$post(
    {},
    {
      init: {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    },
  );
  if (!response.ok) {
    throw new Error('Login gagal. Periksa kredensial dan perusahaan.');
  }
  return sessionSchema.parse(await response.json());
}
