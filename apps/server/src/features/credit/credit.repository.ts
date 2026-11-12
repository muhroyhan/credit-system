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
} from '@credit/database/schema';
import type { DatabaseTransaction } from '@server/constant/type';
import type {
  CreditCollectionInput,
  CreditGuarantorInput,
  CreditInsuranceInput,
  CreditPotonganInput,
  CreditSlikBmpkInput,
  CreditSpouseInput,
} from '@server/features/credit/credit.type';
import { and, eq, inArray } from 'drizzle-orm';

export const creditRepository = {
  async simulationData(debitorId: number) {
    const db = connectDatabase().db;
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
