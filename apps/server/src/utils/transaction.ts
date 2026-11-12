import { connectDatabase } from '@credit/database/client';
import type { DatabaseTransaction } from '@server/constant/type';

/** Commits all awaited repository work together, or rolls it back on rejection. */
export function withTransaction<T>(
  work: (tx: DatabaseTransaction) => Promise<T>,
): Promise<T> {
  return connectDatabase().db.transaction(work);
}
