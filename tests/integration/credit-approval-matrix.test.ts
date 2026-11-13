import { CreditStatusEnum } from '@credit/contracts';
import {
  CreditConflict,
  CreditNotFound,
} from '@server/features/credit/credit.error';
import { creditService } from '@server/features/credit/credit.service';
import { describe, expect, it } from 'vitest';
import { actors } from '../setup/fixtures';
import { setCredit, withApplication } from './fixtures/credit';

describe('APPROVAL-I HRD status matrix', () => {
  it.each([
    CreditStatusEnum.Approved,
    CreditStatusEnum.Rejected,
    CreditStatusEnum.Completed,
    null,
  ])('rejects an HRD decision when current status is %s', async (status) => {
    await withApplication(async (id) => {
      await setCredit(id, { status });
      await expect(
        creditService.approve({ id, status: 'approved' }, actors.company),
      ).rejects.toBeInstanceOf(CreditConflict);
      expect(
        (await creditService.detail(id, actors.company)).credit.status,
      ).toBe(status);
    });
  });
  it('returns not found for a missing application', async () => {
    await expect(
      creditService.approve(
        { id: 2147483647, status: 'approved' },
        actors.company,
      ),
    ).rejects.toBeInstanceOf(CreditNotFound);
  });
});
