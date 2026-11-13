import type { RegistrationInput } from '@web/features/registration/registration.type';
import { apiClient, readApiResponse } from '@web/utils/api-client';

const client = apiClient.api.debitor;
export async function registerEmployee(slug: string, input: RegistrationInput) {
  const { confirmPassword: _confirmation, ...account } = input;
  return readApiResponse(
    await client.register.$post(
      {},
      {
        init: {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...account, slug }),
        },
      },
    ),
  );
}
