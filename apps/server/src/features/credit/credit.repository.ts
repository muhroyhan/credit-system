import type {
  CreditApplication,
  CreditConfirmation,
  CreditQuery,
} from '@credit/contracts';
import { connectDatabase } from '@credit/database/client';
import {
  creditCollection,
  creditGuarantor,
  creditInsurance,
  creditPotongan,
  creditSlikBmpk,
  creditSpouse,
  credits,
  debitorFinancial,
  debitors,
  userBungaKredit,
  users,
} from '@credit/database/schema';
import type { DatabaseTransaction } from '@server/constant/type';
import type {
  CreditChildInput,
  CreditChildTable,
  CreditCollectionInput,
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

/** Keeps child persistence in the caller's transaction; table and input remain paired. */
async function saveChild<T extends CreditChildTable>(
  table: T,
  creditId: number,
  values: CreditChildInput<NoInfer<T>>,
  actor: string,
  tx: DatabaseTransaction,
) {
  const childTable: CreditChildTable = table;
  const [row] = await tx
    .select({ id: childTable.id })
    .from(childTable)
    .where(eq(childTable.creditId, creditId))
    .limit(1);
  if (row) {
    await tx
      .update(childTable)
      .set({ ...values, updatedBy: actor })
      .where(eq(childTable.id, row.id));
  } else {
    await tx
      .insert(childTable)
      .values({ ...values, creditId, createdBy: actor, updatedBy: actor });
  }
}

export const creditRepository = {
  async confirm(
    input: CreditConfirmation,
    actor: string,
    tx: DatabaseTransaction,
  ) {
    await tx
      .update(credits)
      .set({
        bankName: input.bankName,
        bankBranch: input.bankBranch,
        bankAccountName: input.bankAccountName,
        bankAccountNumber: input.bankAccountNumber,
        debitorAcknowledgmentTimestamp: sql`CURRENT_DATE`,
        updatedBy: actor,
      })
      .where(eq(credits.id, input.id));
  },
  async cancel(id: number, actor: string, tx: DatabaseTransaction) {
    await tx
      .update(credits)
      .set({
        statusAdminApproval: 'rejected',
        debitorAcknowledgmentTimestamp: sql`CURRENT_DATE`,
        updatedBy: actor,
      })
      .where(eq(credits.id, id));
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
      .set({ status, updatedBy: actor })
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
    await saveChild(creditCollection, creditId, values, actor, tx);
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
    await saveChild(creditGuarantor, creditId, values, actor, tx);
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
    await saveChild(creditInsurance, creditId, values, actor, tx);
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
    await saveChild(creditPotongan, creditId, values, actor, tx);
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
    await saveChild(creditSlikBmpk, creditId, values, actor, tx);
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
    await saveChild(creditSpouse, creditId, values, actor, tx);
  },
};
