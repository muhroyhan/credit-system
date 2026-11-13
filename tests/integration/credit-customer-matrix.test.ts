import { CreditStatusEnum } from '@credit/contracts';
import { connectDatabase } from '@credit/database/client';
import {
  CreditConflict,
  CreditForbidden,
  CreditInvalid,
} from '@server/features/credit/credit.error';
import { creditService } from '@server/features/credit/credit.service';
import { describe, expect, it } from 'vitest';
import { actors } from '../setup/fixtures';
import { setCredit, withApplication } from './fixtures/credit';

const statuses = [...Object.values(CreditStatusEnum), null];
const invalidApprovals = statuses.flatMap((status) =>
  statuses
    .filter(
      (statusAdminApproval) =>
        status !== 'approved' || statusAdminApproval !== 'approved',
    )
    .map((statusAdminApproval) => ({ status, statusAdminApproval })),
);

function confirmation(id: number, confirmationName: string) {
  return {
    id,
    bankName: 'Bank',
    bankBranch: 'Jakarta',
    bankAccountName: 'QA',
    bankAccountNumber: '001234',
    confirmationName,
    confirmed: true as const,
  };
}

describe('CUSTOMER-I exhaustive approval preconditions', () => {
  it.each(invalidApprovals)(
    'rejects confirm and cancel for HRD=$status BPR=$statusAdminApproval',
    async (patch) => {
      await withApplication(async (id) => {
        await setCredit(id, patch);
        const before = await creditService.status(id, actors.customer);
        await expect(
          creditService.confirm(
            confirmation(id, before.nama ?? ''),
            actors.customer,
          ),
        ).rejects.toBeInstanceOf(CreditConflict);
        await expect(
          creditService.cancel(id, actors.customer),
        ).rejects.toBeInstanceOf(CreditConflict);
        expect(await creditService.status(id, actors.customer)).toEqual(before);
      });
    },
  );

  it.each(['company', 'otherCompany', 'otherCustomer', 'admin'] as const)(
    'denies %s before writing customer confirmation',
    async (actor) => {
      await withApplication(async (id) => {
        await setCredit(id, {
          status: 'approved',
          statusAdminApproval: 'approved',
        });
        await expect(
          creditService.confirm(confirmation(id, 'QA'), actors[actor]),
        ).rejects.toBeInstanceOf(CreditForbidden);
        await expect(
          creditService.cancel(id, actors[actor]),
        ).rejects.toBeInstanceOf(CreditForbidden);
      });
    },
  );

  it.each(['wrong', 'case', 'whitespace'])(
    'rejects %s name without saving account fields',
    async (variation) => {
      await withApplication(async (id) => {
        await setCredit(id, {
          status: 'approved',
          statusAdminApproval: 'approved',
        });
        const before = await creditService.status(id, actors.customer);
        const name = before.nama ?? '';
        const invalid =
          variation === 'case'
            ? name.toUpperCase()
            : variation === 'whitespace'
              ? `${name} `
              : 'Someone else';
        expect(invalid).not.toBe(name);
        await expect(
          creditService.confirm(confirmation(id, invalid), actors.customer),
        ).rejects.toBeInstanceOf(CreditInvalid);
        expect(await creditService.status(id, actors.customer)).toEqual(before);
      });
    },
  );

  it('stores the SQL server date, account zeroes and actor audit', async () => {
    await withApplication(async (id) => {
      await setCredit(id, {
        status: 'approved',
        statusAdminApproval: 'approved',
      });
      const detail = await creditService.status(id, actors.customer);
      const [dates] = await connectDatabase().pool.query(
        "SELECT DATE_FORMAT(CURRENT_DATE(), '%Y-%m-%d') AS today",
      );
      const today = (dates as Array<{ today: string }>)[0]?.today;
      await creditService.confirm(
        confirmation(id, detail.nama ?? ''),
        actors.customer,
      );
      expect(
        (await creditService.status(id, actors.customer)).credit,
      ).toMatchObject({
        bankAccountNumber: '001234',
        debitorAcknowledgmentTimestamp: today,
        updatedBy: 'debitor:900001',
      });
    });
  });

  it('serializes confirmation against cancellation with one committed outcome', async () => {
    await withApplication(async (id) => {
      await setCredit(id, {
        status: 'approved',
        statusAdminApproval: 'approved',
      });
      const detail = await creditService.status(id, actors.customer);
      const results = await Promise.allSettled([
        creditService.confirm(
          confirmation(id, detail.nama ?? ''),
          actors.customer,
        ),
        creditService.cancel(id, actors.customer),
      ]);
      expect(
        results.filter((result) => result.status === 'fulfilled'),
      ).toHaveLength(1);
      const rejected = results.find((result) => result.status === 'rejected');
      expect(rejected?.status === 'rejected' && rejected.reason).toBeInstanceOf(
        CreditConflict,
      );
      const saved = (await creditService.status(id, actors.customer)).credit;
      expect(saved.status).toBe('approved');
      expect(saved.debitorAcknowledgmentTimestamp).toBeTruthy();
      expect(
        saved.statusAdminApproval === 'approved'
          ? saved.bankAccountNumber
          : saved.bankName,
      ).toBe(saved.statusAdminApproval === 'approved' ? '001234' : null);
    });
  });
});
