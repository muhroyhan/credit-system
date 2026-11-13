import { randomUUID } from 'node:crypto';
import { companyQuerySchema } from '@credit/contracts';
import {
  CompanyConflict,
  CompanyNotFound,
} from '@server/features/companies/companies.error';
import { companiesService } from '@server/features/companies/companies.service';
import { describe, expect, it } from 'vitest';

function input() {
  const name = `qa-${randomUUID()}`;
  return {
    entityTypeId: 900001,
    companyName: name,
    username: name,
    email: `${name}@example.invalid`,
    slug: name,
    status: 'active' as const,
    bungaKredits: [{ bungaPercentage: '0.75', jangkaWaktuBulan: '12' }],
    biaya: [{ expenseType: 'Admin', type: '%', value: 1 }],
  };
}
async function withCompany(
  run: (id: number, value: ReturnType<typeof input>) => Promise<void>,
) {
  const value = input();
  const id = await companiesService.save(value, 'qa');
  try {
    await run(id, value);
  } finally {
    await companiesService.remove(id);
  }
}

describe('COMPANY-I configuration transactions', () => {
  it('creates configuration, filters listing and omits password', async () => {
    await withCompany(async (id, value) => {
      const detail = await companiesService.detail(id);
      expect(detail?.bungaKredits).toHaveLength(1);
      expect(detail?.biaya).toHaveLength(1);
      expect(detail).not.toHaveProperty('password');
      const result = await companiesService.list(
        companyQuerySchema.parse({
          slug: value.slug,
          companyName: value.companyName,
        }),
      );
      expect(result.count).toBe(1);
      expect(result.data[0]).toMatchObject({
        id,
        companyName: value.companyName,
      });
    });
  });
  it.each(['username', 'email', 'slug'] as const)(
    'rejects duplicate %s',
    async (field) => {
      await withCompany(async (_id, value) => {
        await expect(
          companiesService.save({ ...input(), [field]: value[field] }, 'qa'),
        ).rejects.toBeInstanceOf(CompanyConflict);
      });
    },
  );
  it('rejects duplicate company name and entity pair', async () => {
    await withCompany(async (_id, value) => {
      await expect(
        companiesService.save(
          { ...input(), companyName: value.companyName },
          'qa',
        ),
      ).rejects.toBeInstanceOf(CompanyConflict);
    });
  });
  it('rejects a missing entity before creating parent or children', async () => {
    await expect(
      companiesService.save({ ...input(), entityTypeId: 2147483647 }, 'qa'),
    ).rejects.toBeInstanceOf(CompanyConflict);
  });
  it('rejects foreign child IDs without partial parent updates', async () => {
    await withCompany(async (id, value) => {
      const before = await companiesService.detail(id);
      await expect(
        companiesService.save(
          {
            ...value,
            companyName: 'Must rollback',
            biaya: [
              {
                ...value.biaya[0],
                expenseType: 'Admin',
                type: '%',
                value: 1,
                id: 900001,
              },
            ],
          },
          'qa',
          id,
        ),
      ).rejects.toBeInstanceOf(CompanyConflict);
      expect(await companiesService.detail(id)).toEqual(before);
    });
  });
  it('rejects repeated child IDs and retains the full configuration', async () => {
    await withCompany(async (id, value) => {
      const before = await companiesService.detail(id);
      const child = before?.bungaKredits[0];
      if (!child?.bungaPercentage || !child.jangkaWaktuBulan) {
        throw new Error('Missing interest fixture');
      }
      const repeated = {
        id: child.id,
        bungaPercentage: child.bungaPercentage,
        jangkaWaktuBulan: child.jangkaWaktuBulan,
      };
      await expect(
        companiesService.save(
          { ...value, bungaKredits: [repeated, repeated] },
          'qa',
          id,
        ),
      ).rejects.toBeInstanceOf(CompanyConflict);
      expect(await companiesService.detail(id)).toEqual(before);
    });
  });
  it('rolls back parent and child replacement after a SQL failure', async () => {
    await withCompany(async (id, value) => {
      const before = await companiesService.detail(id);
      await expect(
        companiesService.save(
          {
            ...value,
            companyName: 'Must rollback',
            biaya: [{ expenseType: 'x'.repeat(256), type: '%', value: 1 }],
          },
          'qa',
          id,
        ),
      ).rejects.toThrow();
      expect(await companiesService.detail(id)).toEqual(before);
    });
  });
  it('reconciles empty arrays by deleting all configuration', async () => {
    await withCompany(async (id, value) => {
      await companiesService.save(
        { ...value, bungaKredits: [], biaya: [] },
        'qa',
        id,
      );
      expect(await companiesService.detail(id)).toMatchObject({
        bungaKredits: [],
        biaya: [],
      });
    });
  });
  it('refuses deletion of a seeded tenant with employees', async () => {
    await expect(companiesService.remove(900001)).rejects.toBeInstanceOf(
      CompanyConflict,
    );
  });
  it('returns absent on missing delete/detail and rejects missing update', async () => {
    expect(await companiesService.detail(2147483647)).toBeNull();
    expect(await companiesService.remove(2147483647)).toBe(false);
    await expect(
      companiesService.save(input(), 'qa', 2147483647),
    ).rejects.toBeInstanceOf(CompanyNotFound);
  });
});
