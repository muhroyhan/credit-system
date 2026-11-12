import { adminInputSchema } from "@credit/contracts";
import type { AppType } from "@credit/server/app";
import { hc } from "hono/client";
import type { z } from "zod";
export type AdminInput = z.infer<typeof adminInputSchema>;
export type Admin = {
  id: number;
  username: string | null;
  email: string | null;
  isActive: boolean | null;
  roles?: { programId: number; value: "READ" | "WRITE" }[];
};
const client = hc<AppType>(window.location.origin);
async function request(path: string, token: string, init?: RequestInit) {
  const response = await fetch(`/api/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Operasi gagal");
  return data;
}
export async function listAdmins(
  token: string,
  query: URLSearchParams,
): Promise<{ count: number; data: Admin[] }> {
  return request(`admin-users?${query}`, token);
}
export async function adminDetail(token: string, id: number): Promise<Admin> {
  return request(`admin-user?id=${id}`, token);
}
export async function programs(token: string) {
  const response = await client.api.programs.$get(
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!response.ok) throw new Error("Gagal memuat program");
  return response.json();
}
export async function saveAdmin(token: string, input: AdminInput, id?: number) {
  const parsed = adminInputSchema.parse(input);
  return request(id ? "admin-user/update" : "admin-user/create", token, {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(id ? { ...parsed, id } : parsed),
  });
}
export async function deleteAdmin(token: string, id: number) {
  return request("admin-user/delete", token, {
    method: "PUT",
    body: JSON.stringify({ id }),
  });
}
