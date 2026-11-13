import type { ExportFormat } from '@web/constant/type';
import {
  type CompanyInput,
  companyDetailSchema,
  companyListSchema,
  entityListSchema,
} from '@web/features/companies/companies.type';
import { apiClient, apiOptions, readApiResponse } from '@web/utils/api-client';
import { downloadFile } from '@web/utils/download-file';

const client = apiClient;
export async function listCompanies(token: string, query: URLSearchParams) {
  return companyListSchema.parse(
    await readApiResponse(
      await client.api.user.list.$get(
        { query: Object.fromEntries(query) } as never,
        apiOptions(token),
      ),
    ),
  );
}
export async function companyDetail(token: string, id: number) {
  return companyDetailSchema.parse(
    await readApiResponse(
      await client.api.user.detail.$get(
        { query: { id: String(id) } } as never,
        apiOptions(token),
      ),
    ),
  );
}
export async function entities(token: string) {
  return entityListSchema.parse(
    await readApiResponse(
      await client.api['entity-types'].$get({}, apiOptions(token)),
    ),
  );
}
export async function saveCompany(
  token: string,
  input: CompanyInput,
  id?: number,
) {
  return readApiResponse(
    id
      ? await client.api.user.update.$put(
          { json: { ...input, id } } as never,
          apiOptions(token),
        )
      : await client.api.user.create.$post(
          { json: input } as never,
          apiOptions(token),
        ),
  );
}
export async function deleteCompany(token: string, id: number) {
  return readApiResponse(
    await client.api.user.delete.$put(
      { json: { id } } as never,
      apiOptions(token),
    ),
  );
}
export async function exportCompanies(
  token: string,
  query: URLSearchParams,
  format: ExportFormat,
) {
  const exportQuery = new URLSearchParams(query);
  exportQuery.set('format', format);
  const response = await client.api.user.export.$get(
    { query: Object.fromEntries(exportQuery) } as never,
    apiOptions(token),
  );
  await downloadFile(response, `companies.${format}`, 'Ekspor gagal');
}
