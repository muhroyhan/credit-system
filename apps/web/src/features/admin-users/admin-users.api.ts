import { adminInputSchema, programSchema } from '@credit/contracts';
import type { ExportFormat } from '@web/constant/type';
import {
  type Admin,
  type AdminInput,
  type AdminList,
  adminListSchema,
  adminSchema,
} from '@web/features/admin-users/admin-users.type';
import { apiClient, apiOptions, readApiResponse } from '@web/utils/api-client';
import { downloadFile } from '@web/utils/download-file';
import { toExportQuery } from '@web/utils/search-params';

const client = apiClient;
export async function listAdmins(
  token: string,
  query: URLSearchParams,
): Promise<AdminList> {
  const response = await client.api['admin-user'].list.$get(
    { query: Object.fromEntries(query) } as never,
    apiOptions(token),
  );
  return adminListSchema.parse(await readApiResponse(response));
}
export async function adminDetail(token: string, id: number): Promise<Admin> {
  const response = await client.api['admin-user'].detail.$get(
    { query: { id: String(id) } } as never,
    apiOptions(token),
  );
  return adminSchema.parse(await readApiResponse(response));
}
export async function programs(token: string) {
  const response = await client.api.programs.$get({}, apiOptions(token));
  return programSchema
    .array()
    .parse(await readApiResponse(response, 'Gagal memuat program'));
}
export async function saveAdmin(token: string, input: AdminInput, id?: number) {
  const parsed = adminInputSchema.parse(input);
  const response = id
    ? await client.api['admin-user'].update.$put(
        { json: { ...parsed, id } } as never,
        apiOptions(token),
      )
    : await client.api['admin-user'].create.$post(
        { json: parsed } as never,
        apiOptions(token),
      );
  return readApiResponse(response);
}
export async function deleteAdmin(token: string, id: number) {
  return readApiResponse(
    await client.api['admin-user'].delete.$put(
      { json: { id } } as never,
      apiOptions(token),
    ),
  );
}

export async function exportAdmins(
  token: string,
  filters: URLSearchParams,
  format: ExportFormat,
): Promise<void> {
  const response = await client.api['admin-user'].export.$get(
    { query: toExportQuery(filters, format) } as never,
    apiOptions(token),
  );
  await downloadFile(
    response,
    `admin-users.${format}`,
    'Gagal mengekspor administrator',
  );
}
