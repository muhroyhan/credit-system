import { CreditStatusEnum } from '@credit/contracts';
import { connectDatabase } from '@credit/database/client';
import {
  creditExpense,
  credits,
  debitors,
  userBiaya,
} from '@credit/database/schema';
import type { DatabaseTransaction } from '@server/constant/type';
import type { CreditExpenseInput } from '@server/features/credit-review/credit-review.type';
import { eq } from 'drizzle-orm';
export const creditReviewRepository = {
  async expenses(id: number) {
    const db = connectDatabase().db;
    return db
      .select({
        id: creditExpense.id,
        expenseName: creditExpense.expenseName,
        unit: creditExpense.unit,
        value: creditExpense.value,
        amount: creditExpense.amount,
      })
      .from(creditExpense)
      .where(eq(creditExpense.creditId, id));
  },
  async notificationRecipient(id: number) {
    const db = connectDatabase().db;
    const [row] = await db
      .select({ phone: debitors.noHp })
      .from(credits)
      .innerJoin(debitors, eq(credits.debitorId, debitors.id))
      .where(eq(credits.id, id))
      .limit(1);
    return row?.phone ?? null;
  },
  async saveReview(
    id: number,
    status: 'approved' | 'rejected' | 'completed',
    principal: number,
    months: number,
    percentage: number,
    installment: number,
    insurance: number,
    actor: string,
    tx: DatabaseTransaction,
  ) {
    await tx
      .update(credits)
      .set({
        statusAdminApproval: status,
        ...(status === CreditStatusEnum.Rejected ? { status: 'rejected' } : {}),
        jumlahPengajuan: String(principal),
        jangkaWaktuBulan: months,
        bungaAngsuranBulanan: String(percentage),
        jumlahAngsuran: String(installment),
        nilaiAngsuran: String(installment),
        pokokAngsuran: String(principal / months),
        biayaAsuransiJiwa: insurance,
        updatedBy: actor,
      })
      .where(eq(credits.id, id));
  },
  async expenseConfiguration(userId: number, tx: DatabaseTransaction) {
    return tx
      .select({
        expenseName: userBiaya.expenseType,
        unit: userBiaya.type,
        value: userBiaya.value,
      })
      .from(userBiaya)
      .where(eq(userBiaya.userId, userId))
      .for('update');
  },
  async replaceExpenses(
    creditId: number,
    items: CreditExpenseInput[],
    actor: string,
    tx: DatabaseTransaction,
  ) {
    await tx.delete(creditExpense).where(eq(creditExpense.creditId, creditId));
    if (items.length) {
      await tx.insert(creditExpense).values(
        items.map((item) => ({
          ...item,
          creditId,
          createdBy: actor,
          updatedBy: actor,
        })),
      );
    }
  },
};
