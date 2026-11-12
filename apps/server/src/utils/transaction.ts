import { connectDatabase } from "@credit/database/client";
export type DatabaseTransaction = Parameters<
  Parameters<ReturnType<typeof connectDatabase>["db"]["transaction"]>[0]
>[0];
export function withTransaction<T>(
  work: (tx: DatabaseTransaction) => Promise<T>,
): Promise<T> {
  return connectDatabase().db.transaction(work);
}
