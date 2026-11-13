import { zipDocuments } from '@server/utils/zip-documents';
import { expect, it } from 'vitest';

it('reads up to five private files concurrently, with deterministic names', async () => {
  let active = 0;
  let maximum = 0;
  const entries = Array.from({ length: 11 }, (_, i) => ({
    id: i + 1,
    debitorId: 1,
    companyName: 'Company',
    createdAt: new Date('2026-01-01T00:00:00'),
    key: `agreements/${i + 1}/00000000-0000-4000-8000-000000000000.pdf`,
  }));
  const storage = {
    put: async () => {},
    remove: async () => {},
    get: async () => {
      active++;
      maximum = Math.max(maximum, active);
      await new Promise((resolve) => setTimeout(resolve, 1));
      active--;
      return new TextEncoder().encode('%PDF-1.4');
    },
  };
  const archive = await zipDocuments(entries, storage);
  expect(maximum).toBe(5);
  expect(new TextDecoder().decode(archive ?? new Uint8Array())).toContain(
    'credit-11_Company_2026-01.pdf',
  );
  expect(
    await zipDocuments(
      [
        {
          ...entries[0],
          id: 1,
          debitorId: 1,
          companyName: 'Company',
          createdAt: new Date(),
          key: '../unsafe',
        },
      ],
      storage,
    ),
  ).toBeNull();
  expect(
    await zipDocuments(
      [
        {
          ...entries[0],
          id: 1,
          debitorId: 1,
          companyName: 'Company',
          createdAt: new Date(),
          key: entries[0]?.key ?? '',
        },
      ],
      {
        ...storage,
        get: async () => null,
      },
    ),
  ).toBeNull();
  expect(
    Array.from((await zipDocuments([], storage)) ?? []).slice(0, 4),
  ).toEqual([80, 75, 5, 6]);
});
