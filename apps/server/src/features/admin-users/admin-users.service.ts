import { adminUsersRepository } from "@server/features/admin-users/admin-users.repository";
import type {
  AdminInput,
  AdminQuery,
} from "@server/features/admin-users/admin-users.type";
import { exportFile } from "@server/utils/export-file";
export const adminUsersService = {
  async exportFile(query: AdminQuery, format: "pdf" | "xlsx") {
    const { data: rows } = await adminUsersRepository.list(query, false);
    const values = rows.map((row) => [
      row.username ?? "",
      row.email ?? "",
      row.isActive ? "Aktif" : "Tidak aktif",
    ]);
    return exportFile({
      title: "Admin User",
      columns: ["Username", "Email", "Status"],
      values,
      format,
    });
  },
  list: (query: AdminQuery) => adminUsersRepository.list(query),
  detail: (id: number) => adminUsersRepository.detail(id),
  async save(input: AdminInput, actor: string, id?: number) {
    const password = input.password
      ? await Bun.password.hash(input.password, {
          algorithm: "bcrypt",
          cost: 10,
        })
      : undefined;
    return adminUsersRepository.save({ ...input, password }, actor, id);
  },
  remove: (id: number) => adminUsersRepository.remove(id),
};
