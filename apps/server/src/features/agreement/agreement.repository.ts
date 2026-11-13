import {
  agreementSequences,
  credits,
  debitors,
  users,
} from '@credit/database/schema';
import type { DatabaseTransaction } from '@server/constant/type';
import { eq, sql } from 'drizzle-orm';

export const agreementRepository = {
  async lockCredit(id: number, tx: DatabaseTransaction) {
    const [row] = await tx
      .select({
        id: credits.id,
        debitorId: credits.debitorId,
        companySlug: users.slug,
        companyName: users.companyName,
        createdMonth: sql<string>`DATE_FORMAT(${credits.createdAt}, '%Y-%m')`,
        status: credits.status,
        statusAdminApproval: credits.statusAdminApproval,
        acknowledgment: credits.debitorAcknowledgmentTimestamp,
        bankName: credits.bankName,
        bankBranch: credits.bankBranch,
        bankAccountName: credits.bankAccountName,
        bankAccountNumber: credits.bankAccountNumber,
        agreementNumber: credits.agreementNumber,
      })
      .from(credits)
      .innerJoin(debitors, eq(credits.debitorId, debitors.id))
      .innerJoin(users, eq(debitors.userId, users.id))
      .where(eq(credits.id, id))
      .for('update');
    return row ?? null;
  },
  async nextSequence(month: string, tx: DatabaseTransaction) {
    await tx
      .insert(agreementSequences)
      .values({ month, nextValue: 1 })
      .onDuplicateKeyUpdate({
        set: { month: sql`${agreementSequences.month}` },
      });
    const [row] = await tx
      .select({ nextValue: agreementSequences.nextValue })
      .from(agreementSequences)
      .where(eq(agreementSequences.month, month))
      .for('update');
    if (!row) {
      return null;
    }
    await tx
      .update(agreementSequences)
      .set({ nextValue: row.nextValue + 1 })
      .where(eq(agreementSequences.month, month));
    return row.nextValue;
  },
  async saveNumber(id: number, number: string, tx: DatabaseTransaction) {
    await tx
      .update(credits)
      .set({ agreementNumber: number })
      .where(eq(credits.id, id));
  },
};
