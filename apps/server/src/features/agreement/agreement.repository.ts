import { connectDatabase } from '@credit/database/client';
import {
  agreementSequences,
  creditExpense,
  credits,
  debitors,
  users,
} from '@credit/database/schema';
import type { DatabaseTransaction } from '@server/constant/type';
import { and, count, eq, sql } from 'drizzle-orm';

export const agreementRepository = {
  async document(id: number) {
    const db = connectDatabase().db;
    const [row] = await db
      .select({
        key: credits.docStorageKey,
        url: credits.docUrl,
        number: credits.agreementNumber,
      })
      .from(credits)
      .where(eq(credits.id, id));
    return row ?? null;
  },
  async count(month: string) {
    const db = connectDatabase().db;
    const [row] = await db
      .select({ count: count() })
      .from(credits)
      .where(
        and(
          sql`DATE_FORMAT(${credits.createdAt}, '%Y-%m') = ${month}`,
          sql`${credits.docUrl} IS NOT NULL`,
        ),
      );
    return row?.count ?? 0;
  },
  async expenses(id: number, tx: DatabaseTransaction) {
    return tx
      .select({ name: creditExpense.expenseName, amount: creditExpense.amount })
      .from(creditExpense)
      .where(eq(creditExpense.creditId, id));
  },
  async saveDocument(id: number, key: string, tx: DatabaseTransaction) {
    await tx
      .update(credits)
      .set({ docStorageKey: key, docUrl: `/api/credit/doc?id=${id}` })
      .where(eq(credits.id, id));
  },
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
        docUrl: credits.docUrl,
        docStorageKey: credits.docStorageKey,
        nama: debitors.namaLengkap,
        noKtp: debitors.noKtp,
        address: debitors.alamatKtp,
        principal: credits.jumlahPengajuan,
        installment: credits.jumlahAngsuran,
        months: credits.jangkaWaktuBulan,
        rate: credits.bungaAngsuranBulanan,
        insurance: credits.biayaAsuransiJiwa,
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
