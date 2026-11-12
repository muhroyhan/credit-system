import type {
  AdminInput,
  AdminQuery,
  AdminRepository,
} from "@server/features/admin-users/admin-users.type";
export class AdminConflict extends Error {}
export class AdminNotFound extends Error {}
export const adminUsersService = (repository: AdminRepository) => ({
  list: (query: AdminQuery) => repository.list(query),
  detail: (id: number) => repository.detail(id),
  async save(input: AdminInput, actor: string, id?: number) {
    const password = input.password
      ? await Bun.password.hash(input.password, {
          algorithm: "bcrypt",
          cost: 10,
        })
      : undefined;
    return repository.save({ ...input, password }, actor, id);
  },
  remove: (id: number) => repository.remove(id),
});
