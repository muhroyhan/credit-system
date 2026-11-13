import type { AppType } from '@credit/server/app';
import type { ApiResponse } from '@web/constant/interface';
import { apiErrorSchema } from '@web/constant/schema';
import { hc } from 'hono/client';

/** Shared browser RPC client; credentials are supplied per request. */
export const apiClient = hc<AppType>(window.location.origin);

/** Adds the current session token without retaining it in the client. */
export function apiOptions(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

/** Reads JSON as unknown so each feature still validates its own DTO. */
export async function readApiResponse(
  response: ApiResponse,
  errorMessage?: string,
): Promise<unknown> {
  const body = await response.json();
  if (!response.ok) {
    throw new Error(
      errorMessage ??
        apiErrorSchema.safeParse(body).data?.error ??
        'Operasi gagal',
    );
  }
  return body;
}
