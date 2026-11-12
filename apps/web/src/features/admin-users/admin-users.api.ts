import { adminInputSchema } from "@credit/contracts";
import type { AppType } from "@credit/server/app";
import {
  type Admin,
  type AdminExportFormat,
  type AdminInput,
  type AdminList,
  type ApiError,
  type ApiResponse,
  adminListSchema,
  adminSchema,
} from "@web/features/admin-users/admin-users.type";
import { hc } from "hono/client";

const client = hc<AppType>(window.location.origin);
function options(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } };
}
async function read(response: ApiResponse): Promise<unknown> {
  const data = await response.json();
  if (!response.ok) {
    const error = data as ApiError;
    throw new Error(error.error ?? "Operasi gagal");
  }
  return data;
}
export async function listAdmins(
  token: string,
  query: URLSearchParams,
): Promise<AdminList> {
  const response = await client.api["admin-user"].list.$get(
    { query: Object.fromEntries(query) } as never,
    options(token),
  );
  return adminListSchema.parse(await read(response));
}
export async function adminDetail(token: string, id: number): Promise<Admin> {
  const response = await client.api["admin-user"].detail.$get(
    { query: { id: String(id) } } as never,
    options(token),
  );
  return adminSchema.parse(await read(response));
}
export async function programs(token: string) {
  const response = await client.api.programs.$get({}, options(token));
  if (!response.ok) throw new Error("Gagal memuat program");
  return response.json();
}
export async function saveAdmin(token: string, input: AdminInput, id?: number) {
  const parsed = adminInputSchema.parse(input);
  const response = id
    ? await client.api["admin-user"].update.$put(
        { json: { ...parsed, id } } as never,
        options(token),
      )
    : await client.api["admin-user"].create.$post(
        { json: parsed } as never,
        options(token),
      );
  return read(response);
}
export async function deleteAdmin(token: string, id: number) {
  return read(
    await client.api["admin-user"].delete.$put(
      { json: { id } } as never,
      options(token),
    ),
  );
}

export async function exportAdmins(
  token: string,
  filters: URLSearchParams,
  format: AdminExportFormat,
): Promise<void> {
  filters.set("format", format);
  const response = await client.api["admin-user"].export.$get(
    { query: Object.fromEntries(filters) } as never,
    options(token),
  );
  if (!response.ok) throw new Error("Gagal mengekspor administrator");
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = `admin-users.${format}`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
