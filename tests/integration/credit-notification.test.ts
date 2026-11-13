import { CreditConflict } from '@server/features/credit/credit.error';
import { creditService } from '@server/features/credit/credit.service';
import { creditReviewService } from '@server/features/credit-review/credit-review.service';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { actors, application, profile } from '../setup/fixtures';
import { withApplication } from './fixtures/credit';
import { withEmployee } from './fixtures/employee';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('REVIEW-I notification after SQL commit', () => {
  it.each(['success', 'http-error', 'network-error'])(
    'keeps approval and one snapshot after %s',
    async (outcome) => {
      vi.stubEnv('WHATSAPP_GRAPH_VERSION', 'v99.0');
      vi.stubEnv('WHATSAPP_PHONE_NUMBER_ID', '123456789');
      vi.stubEnv('WHATSAPP_ACCESS_TOKEN', 'synthetic-never-sent');
      vi.stubEnv('WHATSAPP_TEMPLATE_NAME', 'synthetic');
      vi.stubEnv('WHATSAPP_TEMPLATE_LANGUAGE', 'id');
      vi.stubEnv('PUBLIC_APP_URL', 'https://credit.example.invalid');
      const fetchMock = vi.fn(async () => {
        if (outcome === 'network-error') {
          throw new Error('synthetic network failure');
        }
        return new Response('{}', {
          status: outcome === 'http-error' ? 503 : 200,
        });
      });
      vi.stubGlobal('fetch', fetchMock);
      await withEmployee(async (debitorId, service) => {
        await service.saveProfile(
          debitorId,
          { ...profile, noHp: '628123456789' },
          actors.company,
        );
        await withApplication(
          async (id) => {
            await creditService.approve(
              { id, status: 'approved' },
              actors.company,
            );
            const input = {
              id,
              jumlahPengajuan: '12000000',
              jangkaWaktuBulan: 12,
              biayaAsuransiJiwa: 0,
              statusAdminApproval: 'approved' as const,
            };
            const result = await creditReviewService.review(
              input,
              actors.admin,
            );
            expect(result.notification).toBe(
              outcome === 'success' ? 'sent' : 'failed',
            );
            expect(fetchMock).toHaveBeenCalledTimes(1);
            const saved = await creditReviewService.reviewDetail(
              id,
              actors.admin,
            );
            expect(saved.credit.statusAdminApproval).toBe('approved');
            expect(saved.expenses.length).toBeGreaterThan(0);
            await expect(
              creditReviewService.review(input, actors.admin),
            ).rejects.toBeInstanceOf(CreditConflict);
            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(
              (await creditReviewService.reviewDetail(id, actors.admin))
                .expenses,
            ).toEqual(saved.expenses);
          },
          { ...application, debitorId },
        );
      });
    },
  );
});
