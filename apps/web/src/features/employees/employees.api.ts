import type { AppType } from '@credit/server/app';
import type { ApiResponse } from '@web/constant/interface';
import { apiErrorSchema } from '@web/constant/schema';
import type { ExportFormat } from '@web/constant/type';
import {
  type EmployeeFormInput,
  type EmployeeProfile,
  employeeDetailSchema,
  employeeListSchema,
  type RegistrationInput,
} from '@web/features/employees/employees.type';
import { hc } from 'hono/client';

const client = hc<AppType>(window.location.origin).api.debitor;
function options(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } };
}
async function read(response: ApiResponse) {
  const body = await response.json();
  if (!response.ok) {
    throw new Error(
      apiErrorSchema.safeParse(body).data?.error ?? 'Operasi gagal',
    );
  }
  return body;
}
export async function registerEmployee(slug: string, input: RegistrationInput) {
  const { confirmPassword: _confirmation, ...account } = input;
  return read(
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
export async function listEmployees(token: string, query: URLSearchParams) {
  return employeeListSchema.parse(
    await read(
      await client.list.$get(
        { query: Object.fromEntries(query) } as never,
        options(token),
      ),
    ),
  );
}
export async function employeeDetail(token: string, id: number) {
  return employeeDetailSchema.parse(
    await read(
      await client.detail.$get(
        { query: { id: String(id) } } as never,
        options(token),
      ),
    ),
  );
}
export async function saveEmployee(
  token: string,
  input: EmployeeFormInput,
  id?: number,
) {
  const { userId, ...account } = input;
  const value = { ...account, password: input.password || undefined };
  const init = {
    method: id ? 'PUT' : 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(id ? { ...value, id } : { ...value, userId }),
  };
  return read(
    id
      ? await client.update.$put({}, { init })
      : await client.create.$post({}, { init }),
  );
}
export async function saveProfile(
  token: string,
  id: number,
  profile: EmployeeProfile,
) {
  return read(
    await client.profile.$put(
      {},
      {
        init: {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, profile }),
        },
      },
    ),
  );
}
export async function uploadDocuments(token: string, body: FormData) {
  return read(
    await client.documents.$post({}, { ...options(token), init: { body } }),
  );
}
export async function deleteEmployee(token: string, id: number) {
  return read(
    await client.delete.$put(
      {},
      {
        init: {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        },
      },
    ),
  );
}
async function download(response: Response, filename: string) {
  if (!response.ok) {
    throw new Error('Unduhan gagal');
  }
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function exportEmployees(
  token: string,
  query: URLSearchParams,
  format: ExportFormat,
) {
  query.set('format', format);
  await download(
    await client.export.$get(
      { query: Object.fromEntries(query) } as never,
      options(token),
    ),
    `employees.${format}`,
  );
}
export async function downloadDocument(
  token: string,
  id: number,
  kind: string,
) {
  const response = await client.document.$get(
    { query: { id: String(id), kind } } as never,
    options(token),
  );
  const filename =
    response.headers
      .get('Content-Disposition')
      ?.match(/filename="([^"]+)"/)?.[1] ?? 'document';
  await download(response, filename);
}
