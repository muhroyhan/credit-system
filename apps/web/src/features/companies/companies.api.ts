import type { AppType } from "@credit/server/app";
import {
  type CompanyApiResponse,
  type CompanyInput,
  companyApiErrorSchema,
  companyDetailSchema,
  companyListSchema,
  type ExportFormat,
  entityListSchema,
} from "@web/features/companies/companies.type";
import { hc } from "hono/client";

const client = hc<AppType>(window.location.origin);
const options = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});
async function read(response: CompanyApiResponse) {
  const value = await response.json();
  if (!response.ok)
    throw new Error(
      companyApiErrorSchema.safeParse(value).data?.error ?? "Operasi gagal",
    );
  return value;
}
export async function listCompanies(token: string, query: URLSearchParams) {
  return companyListSchema.parse(
    await read(
      await client.api.users.$get(
        { query: Object.fromEntries(query) } as never,
        options(token),
      ),
    ),
  );
}
export async function companyDetail(token: string, id: number) {
  return companyDetailSchema.parse(
    await read(
      await client.api.user.$get(
        { query: { id: String(id) } } as never,
        options(token),
      ),
    ),
  );
}
export async function entities(token: string) {
  return entityListSchema.parse(
    await read(await client.api["entity-types"].$get({}, options(token))),
  );
}
export async function saveCompany(
  token: string,
  input: CompanyInput,
  id?: number,
) {
  return read(
    id
      ? await client.api.user.update.$put(
          { json: { ...input, id } } as never,
          options(token),
        )
      : await client.api.user.create.$post(
          { json: input } as never,
          options(token),
        ),
  );
}
export async function deleteCompany(token: string, id: number) {
  return read(
    await client.api.user.delete.$put(
      { json: { id } } as never,
      options(token),
    ),
  );
}
export async function exportCompanies(
  token: string,
  query: URLSearchParams,
  format: ExportFormat,
) {
  query.set("format", format);
  const response = await client.api.user.export.$get(
    { query: Object.fromEntries(query) } as never,
    options(token),
  );
  if (!response.ok) throw new Error("Ekspor gagal");
  const url = URL.createObjectURL(await response.blob());
  const a = document.createElement("a");
  a.href = url;
  a.download = `companies.${format}`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
