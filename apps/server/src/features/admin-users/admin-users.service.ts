import { adminUsersRepository } from "@server/features/admin-users/admin-users.repository";

import type {
  AdminInput,
  AdminQuery,
} from "@server/features/admin-users/admin-users.type";
export const adminUsersService = {
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
