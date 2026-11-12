import type {
  adminInputSchema,
  adminListDtoSchema,
  adminListQuerySchema,
  adminUserDtoSchema,
} from "@credit/contracts";
import type { DatabaseTransaction } from "@server/utils/transaction";
import type { z } from "zod";
export type AdminInput = z.infer<typeof adminInputSchema>;
export type AdminQuery = z.infer<typeof adminListQuerySchema>;
export interface AdminRepository {
  list(
    query: AdminQuery,
    paginate?: boolean,
  ): Promise<z.infer<typeof adminListDtoSchema>>;
  detail(id: number): Promise<z.infer<typeof adminUserDtoSchema> | null>;
  save(
    input: AdminInput,
    actor: string,
    id?: number,
    transaction?: DatabaseTransaction,
  ): Promise<number>;
  remove(id: number, transaction?: DatabaseTransaction): Promise<boolean>;
}

import type { SchemaOf } from "@server/infrastructure/rpc-types";
export type AdminUsersRoutes<L, D, C, U, R, E> = SchemaOf<L> &
  SchemaOf<D> &
  SchemaOf<C> &
  SchemaOf<U> &
  SchemaOf<R> &
  SchemaOf<E>;
