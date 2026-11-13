import type { ExportTypeEnum } from '@credit/contracts';
import {
  type EmployeeProfile,
  employeeDetailSchema,
  employeeListSchema,
} from '@credit/contracts';
import type { EmployeeFormInput } from '@web/features/employees/employees.type';
import { apiClient, apiOptions, readApiResponse } from '@web/utils/api-client';
import { downloadFile } from '@web/utils/download-file';
import { toExportQuery } from '@web/utils/search-params';

const client = apiClient.api.debitor;
export async function listEmployees(token: string, query: URLSearchParams) {
  return employeeListSchema.parse(
    await readApiResponse(
      await client.list.$get(
        { query: Object.fromEntries(query) } as never,
        apiOptions(token),
      ),
    ),
  );
}
export async function employeeDetail(token: string, id: number) {
  return employeeDetailSchema.parse(
    await readApiResponse(
      await client.detail.$get(
        { query: { id: String(id) } } as never,
        apiOptions(token),
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
      ...apiOptions(token).headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(id ? { ...value, id } : { ...value, userId }),
  };
  return readApiResponse(
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
  return readApiResponse(
    await client.profile.$put(
      {},
      {
        init: {
          method: 'PUT',
          headers: {
            ...apiOptions(token).headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, profile }),
        },
      },
    ),
  );
}
export async function uploadDocuments(token: string, body: FormData) {
  return readApiResponse(
    await client.documents.$post({}, { ...apiOptions(token), init: { body } }),
  );
}
export async function deleteEmployee(token: string, id: number) {
  return readApiResponse(
    await client.delete.$put(
      {},
      {
        init: {
          method: 'PUT',
          headers: {
            ...apiOptions(token).headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        },
      },
    ),
  );
}
export async function exportEmployees(
  token: string,
  query: URLSearchParams,
  format: ExportTypeEnum,
) {
  await downloadFile(
    await client.export.$get(
      { query: toExportQuery(query, format) } as never,
      apiOptions(token),
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
    apiOptions(token),
  );
  const filename =
    response.headers
      .get('Content-Disposition')
      ?.match(/filename="([^"]+)"/)?.[1] ?? 'document';
  await downloadFile(response, filename);
}
