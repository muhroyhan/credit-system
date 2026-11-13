import type { CreditApplication, CreditQuery } from '@credit/contracts';
import { connectDatabase } from '@credit/database/client';
import {
  creditCollection,
  creditExpense,
  creditGuarantor,
  creditInsurance,
  creditPotongan,
  creditSlikBmpk,
  creditSpouse,
  credits,
  debitorFinancial,
  debitors,
  userBiaya,
  userBungaKredit,
  users,
} from '@credit/database/schema';
import type { DatabaseTransaction } from '@server/constant/type';
import type {
  CreditCollectionInput,
  CreditExpenseInput,
  CreditGuarantorInput,
  CreditInsuranceInput,
  CreditPotonganInput,
  CreditSlikBmpkInput,
  CreditSpouseInput,
} from '@server/features/credit/credit.type';
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  like,
  lte,
  sql,
} from 'drizzle-orm';

export const creditRepository = {
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
        ...(status === 'rejected' ? { status: 'rejected' } : {}),
        jumlahPengajuan: String(principal),
        jangkaWaktuBulan: months,
        bungaAngsuranBulanan: String(percentage),
        jumlahAngsuran: String(installment),
        nilaiAngsuran: String(installment),
        pokokAngsuran: String(principal / months),
        biayaAsuransiJiwa: insurance,
        updatedBy: actor,
        updatedAt: new Date(),
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
  async debitorId(id: number, tx: DatabaseTransaction) {
    const [row] = await tx
      .select({ debitorId: credits.debitorId })
      .from(credits)
      .where(eq(credits.id, id))
      .limit(1);
    return row?.debitorId ?? null;
  },
  async approve(
    id: number,
    status: 'approved' | 'rejected',
    actor: string,
    tx: DatabaseTransaction,
  ) {
    await tx
      .update(credits)
      .set({ status, updatedBy: actor, updatedAt: new Date() })
      .where(eq(credits.id, id));
  },
  async simulationData(debitorId: number, tx?: DatabaseTransaction) {
    const db = tx ?? connectDatabase().db;
    const [debitor] = await db
      .select({ userId: debitors.userId, income: debitorFinancial.takehomePay })
      .from(debitors)
      .leftJoin(debitorFinancial, eq(debitorFinancial.debitorId, debitors.id))
      .where(eq(debitors.id, debitorId))
      .limit(1);
    if (!debitor || debitor.userId === null) {
      return null;
    }
    const rates = await db
      .select({
        id: userBungaKredit.id,
        jangkaWaktuBulan: userBungaKredit.jangkaWaktuBulan,
        bungaPercentage: userBungaKredit.bungaPercentage,
      })
      .from(userBungaKredit)
      .where(eq(userBungaKredit.userId, debitor.userId));
    const open = await db
      .select({ amount: credits.jumlahPengajuan })
      .from(credits)
      .where(
        and(
          eq(credits.debitorId, debitorId),
          inArray(credits.status, ['pending', 'approved']),
        ),
      );
    return { income: debitor.income, rates, open };
  },
  async detail(id: number, tx?: DatabaseTransaction) {
    const db = tx ?? connectDatabase().db;
    const query = db
      .select({
        credit: credits,
        userId: debitors.userId,
        nama: debitors.namaLengkap,
        noKtp: debitors.noKtp,
        companyName: users.companyName,
      })
      .from(credits)
      .innerJoin(debitors, eq(credits.debitorId, debitors.id))
      .leftJoin(users, eq(debitors.userId, users.id))
      .where(eq(credits.id, id));
    const [row] = await (tx ? query.for('update') : query);
    return row ?? null;
  },
  async children(id: number) {
    const db = connectDatabase().db;
    const [collection, guarantor, insurance, potongan, slikBmpk, spouse] =
      await Promise.all([
        db
          .select()
          .from(creditCollection)
          .where(eq(creditCollection.creditId, id))
          .limit(1),
        db
          .select()
          .from(creditGuarantor)
          .where(eq(creditGuarantor.creditId, id))
          .limit(1),
        db
          .select()
          .from(creditInsurance)
          .where(eq(creditInsurance.creditId, id))
          .limit(1),
        db
          .select()
          .from(creditPotongan)
          .where(eq(creditPotongan.creditId, id))
          .limit(1),
        db
          .select()
          .from(creditSlikBmpk)
          .where(eq(creditSlikBmpk.creditId, id))
          .limit(1),
        db
          .select()
          .from(creditSpouse)
          .where(eq(creditSpouse.creditId, id))
          .limit(1),
      ]);
    return {
      collection: collection[0] ?? null,
      guarantor: guarantor[0] ?? null,
      insurance: insurance[0] ?? null,
      potongan: potongan[0] ?? null,
      slikBmpk: slikBmpk[0] ?? null,
      spouse: spouse[0] ?? null,
    };
  },
  async list(
    query: CreditQuery,
    userId?: number,
    debitorId?: number,
    paginate = true,
  ) {
    const db = connectDatabase().db;
    const where = and(
      userId === undefined ? undefined : eq(debitors.userId, userId),
      debitorId === undefined ? undefined : eq(credits.debitorId, debitorId),
      query.userId === undefined
        ? undefined
        : eq(debitors.userId, query.userId),
      query.debitorId === undefined
        ? undefined
        : eq(credits.debitorId, query.debitorId),
      query.nama ? like(debitors.namaLengkap, `%${query.nama}%`) : undefined,
      query.noKtp ? like(debitors.noKtp, `%${query.noKtp}%`) : undefined,
      query.status ? eq(credits.status, query.status) : undefined,
      query.statusAdminApproval
        ? eq(credits.statusAdminApproval, query.statusAdminApproval)
        : undefined,
      query.createdFrom
        ? gte(credits.createdAt, new Date(`${query.createdFrom}T00:00:00`))
        : undefined,
      query.createdTo
        ? lte(credits.createdAt, new Date(`${query.createdTo}T23:59:59.999`))
        : undefined,
    );
    const [total] = await db
      .select({ count: count() })
      .from(credits)
      .innerJoin(debitors, eq(credits.debitorId, debitors.id))
      .where(where);
    const selection = db
      .select({
        credit: credits,
        userId: debitors.userId,
        nama: debitors.namaLengkap,
        companyName: users.companyName,
      })
      .from(credits)
      .innerJoin(debitors, eq(credits.debitorId, debitors.id))
      .leftJoin(users, eq(debitors.userId, users.id))
      .where(where)
      .orderBy(
        (query.sortDirection === 'asc' ? asc : desc)(
          query.sortBy === 'jumlahPengajuan'
            ? sql`CAST(${credits.jumlahPengajuan} AS DECIMAL(20, 0))`
            : credits[query.sortBy],
        ),
        desc(credits.id),
      );
    return {
      count: total?.count ?? 0,
      data: await (paginate
        ? selection.limit(query.limit).offset((query.page - 1) * query.limit)
        : selection),
    };
  },
  async save(
    input: CreditApplication,
    values: { principal: number; installment: number; percentage: number },
    actor: string,
    tx: DatabaseTransaction,
    id?: number,
  ) {
    const data = {
      debitorId: input.debitorId,
      tanggalPengajuan: input.tanggalPengajuan,
      jumlahPengajuan: String(values.principal),
      jangkaWaktuBulan: input.jangkaWaktuBulan,
      jumlahAngsuran: String(values.installment),
      nilaiAngsuran: String(values.installment),
      pokokAngsuran: String(values.principal / input.jangkaWaktuBulan),
      bungaAngsuranBulanan: String(values.percentage),
      updatedBy: actor,
      updatedAt: new Date(),
    };
    if (id !== undefined) {
      await tx.update(credits).set(data).where(eq(credits.id, id));
      return id;
    }
    const [row] = await tx
      .insert(credits)
      .values({ ...data, status: 'pending', createdBy: actor })
      .$returningId();
    return row?.id;
  },
  async collection(creditId: number, tx: DatabaseTransaction) {
    const [row] = await tx
      .select()
      .from(creditCollection)
      .where(eq(creditCollection.creditId, creditId))
      .limit(1);
    return row ?? null;
  },
  async saveCollection(
    creditId: number,
    values: CreditCollectionInput,
    actor: string,
    tx: DatabaseTransaction,
  ) {
    const [row] = await tx
      .select({ id: creditCollection.id })
      .from(creditCollection)
      .where(eq(creditCollection.creditId, creditId))
      .limit(1);
    if (row) {
      await tx
        .update(creditCollection)
        .set({ ...values, updatedBy: actor, updatedAt: new Date() })
        .where(eq(creditCollection.id, row.id));
    } else {
      await tx
        .insert(creditCollection)
        .values({ ...values, creditId, createdBy: actor, updatedBy: actor });
    }
  },
  async guarantor(creditId: number, tx: DatabaseTransaction) {
    const [row] = await tx
      .select()
      .from(creditGuarantor)
      .where(eq(creditGuarantor.creditId, creditId))
      .limit(1);
    return row ?? null;
  },
  async saveGuarantor(
    creditId: number,
    values: CreditGuarantorInput,
    actor: string,
    tx: DatabaseTransaction,
  ) {
    const [row] = await tx
      .select({ id: creditGuarantor.id })
      .from(creditGuarantor)
      .where(eq(creditGuarantor.creditId, creditId))
      .limit(1);
    if (row) {
      await tx
        .update(creditGuarantor)
        .set({ ...values, updatedBy: actor, updatedAt: new Date() })
        .where(eq(creditGuarantor.id, row.id));
    } else {
      await tx
        .insert(creditGuarantor)
        .values({ ...values, creditId, createdBy: actor, updatedBy: actor });
    }
  },
  async insurance(creditId: number, tx: DatabaseTransaction) {
    const [row] = await tx
      .select()
      .from(creditInsurance)
      .where(eq(creditInsurance.creditId, creditId))
      .limit(1);
    return row ?? null;
  },
  async saveInsurance(
    creditId: number,
    values: CreditInsuranceInput,
    actor: string,
    tx: DatabaseTransaction,
  ) {
    const [row] = await tx
      .select({ id: creditInsurance.id })
      .from(creditInsurance)
      .where(eq(creditInsurance.creditId, creditId))
      .limit(1);
    if (row) {
      await tx
        .update(creditInsurance)
        .set({ ...values, updatedBy: actor, updatedAt: new Date() })
        .where(eq(creditInsurance.id, row.id));
    } else {
      await tx
        .insert(creditInsurance)
        .values({ ...values, creditId, createdBy: actor, updatedBy: actor });
    }
  },
  async potongan(creditId: number, tx: DatabaseTransaction) {
    const [row] = await tx
      .select()
      .from(creditPotongan)
      .where(eq(creditPotongan.creditId, creditId))
      .limit(1);
    return row ?? null;
  },
  async savePotongan(
    creditId: number,
    values: CreditPotonganInput,
    actor: string,
    tx: DatabaseTransaction,
  ) {
    const [row] = await tx
      .select({ id: creditPotongan.id })
      .from(creditPotongan)
      .where(eq(creditPotongan.creditId, creditId))
      .limit(1);
    if (row) {
      await tx
        .update(creditPotongan)
        .set({ ...values, updatedBy: actor, updatedAt: new Date() })
        .where(eq(creditPotongan.id, row.id));
    } else {
      await tx
        .insert(creditPotongan)
        .values({ ...values, creditId, createdBy: actor, updatedBy: actor });
    }
  },
  async slikBmpk(creditId: number, tx: DatabaseTransaction) {
    const [row] = await tx
      .select()
      .from(creditSlikBmpk)
      .where(eq(creditSlikBmpk.creditId, creditId))
      .limit(1);
    return row ?? null;
  },
  async saveSlikBmpk(
    creditId: number,
    values: CreditSlikBmpkInput,
    actor: string,
    tx: DatabaseTransaction,
  ) {
    const [row] = await tx
      .select({ id: creditSlikBmpk.id })
      .from(creditSlikBmpk)
      .where(eq(creditSlikBmpk.creditId, creditId))
      .limit(1);
    if (row) {
      await tx
        .update(creditSlikBmpk)
        .set({ ...values, updatedBy: actor, updatedAt: new Date() })
        .where(eq(creditSlikBmpk.id, row.id));
    } else {
      await tx
        .insert(creditSlikBmpk)
        .values({ ...values, creditId, createdBy: actor, updatedBy: actor });
    }
  },
  async spouse(creditId: number, tx: DatabaseTransaction) {
    const [row] = await tx
      .select()
      .from(creditSpouse)
      .where(eq(creditSpouse.creditId, creditId))
      .limit(1);
    return row ?? null;
  },
  async saveSpouse(
    creditId: number,
    values: CreditSpouseInput,
    actor: string,
    tx: DatabaseTransaction,
  ) {
    const [row] = await tx
      .select({ id: creditSpouse.id })
      .from(creditSpouse)
      .where(eq(creditSpouse.creditId, creditId))
      .limit(1);
    if (row) {
      await tx
        .update(creditSpouse)
        .set({ ...values, updatedBy: actor, updatedAt: new Date() })
        .where(eq(creditSpouse.id, row.id));
    } else {
      await tx
        .insert(creditSpouse)
        .values({ ...values, creditId, createdBy: actor, updatedBy: actor });
    }
  },
};
