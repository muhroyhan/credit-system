import type { adminInputSchema, adminListQuerySchema } from "@credit/contracts";
import type { z } from "zod";
export type AdminInput = z.infer<typeof adminInputSchema>;
export type AdminQuery = z.infer<typeof adminListQuerySchema>;
export interface AdminRepository {
  list(query: AdminQuery): Promise<unknown>;
  detail(id: number): Promise<unknown | null>;
  save(input: AdminInput, actor: string, id?: number): Promise<number>;
  remove(id: number): Promise<boolean>;
}
export class AdminConflict extends Error {}
export class AdminNotFound extends Error {}
export const createAdminService = (repository: AdminRepository) => ({
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
