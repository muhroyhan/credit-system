import { creditQuerySchema } from '@credit/contracts';
import {
  CreditForbidden,
  CreditNotFound,
} from '@server/features/credit/credit.error';
import { creditService } from '@server/features/credit/credit.service';
import { describe, expect, it } from 'vitest';
import { actors, application } from '../setup/fixtures';
import { withApplication } from './fixtures/credit';

describe('CREDIT-I actor scopes and listing filters', () => {
  it.each(['company', 'customer'] as const)(
    'never allows %s query filters to override tenant scope',
    async (actor) => {
      await withApplication(async (id) => {
        const own = await creditService.list(
          creditQuerySchema.parse({}),
          actors[actor],
        );
        expect(own.data.some((row) => row.credit.id === id)).toBe(true);
        for (const query of [{ userId: 900002 }, { debitorId: 900002 }]) {
          const result = await creditService.list(
            creditQuerySchema.parse(query),
            actors[actor],
          );
          expect(result.data).toEqual([]);
          expect(result.count).toBe(0);
        }
      });
    },
  );
  it.each(['otherCompany', 'otherCustomer'] as const)(
    'denies %s detail and mutation of another tenant',
    async (actor) => {
      await withApplication(async (id) => {
        await expect(
          creditService.detail(id, actors[actor]),
        ).rejects.toBeInstanceOf(CreditForbidden);
        await expect(
          creditService.save(application, actors[actor], id),
        ).rejects.toBeInstanceOf(CreditForbidden);
      });
    },
  );
  it('returns empty results for unmatched filters and not found for missing detail', async () => {
    const result = await creditService.list(
      creditQuerySchema.parse({ nama: 'no-such-synthetic-name' }),
      actors.company,
    );
    expect(result).toMatchObject({ count: 0, data: [] });
    await expect(
      creditService.detail(2147483647, actors.company),
    ).rejects.toBeInstanceOf(CreditNotFound);
  });
  it('denies an administrator without the exact CGP action', async () => {
    const noRoles = { ...actors.admin, permissions: [] };
    await expect(
      creditService.list(creditQuerySchema.parse({}), noRoles),
    ).rejects.toBeInstanceOf(CreditForbidden);
    await expect(
      creditService.save(application, noRoles),
    ).rejects.toBeInstanceOf(CreditForbidden);
  });
});
