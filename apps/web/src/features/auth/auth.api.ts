import { loginSchema } from '@credit/contracts';
import { sessionSchema } from '@web/constant/schema';
import type { Session } from '@web/constant/type';
import { type LoginInput, slugListSchema } from '@web/features/auth/auth.type';
import { apiClient, readApiResponse } from '@web/utils/api-client';

const client = apiClient;
export async function getSlugs() {
  const response = await client.api.user.slugs.$get();
  return slugListSchema.parse(
    await readApiResponse(response, 'Gagal memuat perusahaan'),
  );
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
  return sessionSchema.parse(
    await readApiResponse(
      response,
      'Login gagal. Periksa kredensial dan perusahaan.',
    ),
  );
}
