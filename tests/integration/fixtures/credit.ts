import type { CreditApplication } from '@credit/contracts';
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
} from '@credit/database/schema';
import { creditService } from '@server/features/credit/credit.service';
import { eq } from 'drizzle-orm';
import { actors, application } from '../../setup/fixtures';

/** Gives each scenario its own real application and removes every credit child. */
export async function withApplication(
  run: (id: number) => Promise<void>,
  input: CreditApplication = application,
) {
  const id = await creditService.save(input, actors.company);
  try {
    await run(id);
  } finally {
    const db = connectDatabase().db;
    for (const table of [
      creditCollection,
      creditExpense,
      creditGuarantor,
      creditInsurance,
      creditPotongan,
      creditSlikBmpk,
      creditSpouse,
    ]) {
      await db.delete(table).where(eq(table.creditId, id));
    }
    await db.delete(credits).where(eq(credits.id, id));
  }
}

/** Sets only fixture preconditions; transitions under test use the public service. */
export async function setCredit(
  id: number,
  patch: Partial<typeof credits.$inferInsert>,
) {
  await connectDatabase()
    .db.update(credits)
    .set(patch)
    .where(eq(credits.id, id));
}
