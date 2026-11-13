import {
  CreditConflict,
  CreditForbidden,
} from '@server/features/credit/credit.error';
import { creditService } from '@server/features/credit/credit.service';
import { creditReviewService } from '@server/features/credit-review/credit-review.service';
import { describe, expect, it } from 'vitest';
import { actors, application } from '../setup/fixtures';
import { setCredit, withApplication } from './fixtures/credit';

describe('REVIEW-I BPR transition matrix', () => {
  it.each(['pending', 'rejected', 'completed', null] as const)(
    'rejects BPR review when HRD is %s',
    async (status) => {
      await withApplication(async (id) => {
        await setCredit(id, { status });
        await expect(
          creditReviewService.review(
            {
              id,
              ...application,
              statusAdminApproval: 'approved',
              biayaAsuransiJiwa: 0,
            },
            actors.admin,
          ),
        ).rejects.toBeInstanceOf(CreditConflict);
      });
    },
  );
  it('allows approved to completed while preserving a single expense snapshot', async () => {
    await withApplication(async (id) => {
      await creditService.approve({ id, status: 'approved' }, actors.company);
      const input = {
        id,
        jumlahPengajuan: '12000000',
        jangkaWaktuBulan: 12,
        biayaAsuransiJiwa: 0,
        statusAdminApproval: 'approved' as const,
      };
      const approved = await creditReviewService.review(input, actors.admin);
      expect(approved.notification).toBe('not-configured');
      const before = (await creditReviewService.reviewDetail(id, actors.admin))
        .expenses;
      expect(before.length).toBeGreaterThan(0);
      expect(
        await creditReviewService.review(
          { ...input, statusAdminApproval: 'completed' },
          actors.admin,
        ),
      ).toMatchObject({ id, notification: 'not-required' });
      expect(
        (await creditReviewService.reviewDetail(id, actors.admin)).expenses,
      ).toEqual(before);
    });
  });
  it('requires update permission for changes in addition to approval', async () => {
    await withApplication(async (id) => {
      await creditService.approve({ id, status: 'approved' }, actors.company);
      const limited = {
        ...actors.admin,
        permissions: [{ program: 'DKN', value: 'APPROVAL' }],
      };
      await expect(
        creditReviewService.review(
          {
            id,
            jumlahPengajuan: '13000000',
            jangkaWaktuBulan: 12,
            biayaAsuransiJiwa: 0,
            statusAdminApproval: 'approved',
          },
          limited,
        ),
      ).rejects.toBeInstanceOf(CreditForbidden);
      expect(
        (await creditService.detail(id, actors.company)).credit.jumlahPengajuan,
      ).toBe('12000000');
    });
  });
  it.each(['rejected', 'completed'] as const)(
    'locks BPR status %s',
    async (statusAdminApproval) => {
      await withApplication(async (id) => {
        await setCredit(id, { status: 'approved', statusAdminApproval });
        await expect(
          creditReviewService.review(
            {
              id,
              jumlahPengajuan: '12000000',
              jangkaWaktuBulan: 12,
              biayaAsuransiJiwa: 0,
              statusAdminApproval: 'completed',
            },
            actors.admin,
          ),
        ).rejects.toBeInstanceOf(CreditConflict);
      });
    },
  );
});
