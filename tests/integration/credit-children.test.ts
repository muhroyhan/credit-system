import { creditService } from '@server/features/credit/credit.service';
import { describe, expect, it } from 'vitest';
import { actors, application } from '../setup/fixtures';
import { withApplication } from './fixtures/credit';

describe('CREDIT-I every writable child', () => {
  it.each([
    [
      'collection',
      { collection: { namaMarketing: 'initial' } },
      { collection: { namaMarketing: 'updated' } },
      { namaMarketing: 'updated' },
    ],
    [
      'guarantor',
      { guarantor: { nama: 'initial' } },
      { guarantor: { nama: 'updated' } },
      { nama: 'updated' },
    ],
    [
      'insurance',
      { insurance: { namaAsuransi: 'initial' } },
      { insurance: { namaAsuransi: 'updated' } },
      { namaAsuransi: 'updated' },
    ],
    [
      'slikBmpk',
      { slikBmpk: { keterangan: 'initial' } },
      { slikBmpk: { keterangan: 'updated' } },
      { keterangan: 'updated' },
    ],
    [
      'spouse',
      { spouse: { status: 'initial' } },
      { spouse: { status: 'updated' } },
      { status: 'updated' },
    ],
  ] as const)(
    'inserts then updates %s while keeping its row ID',
    async (kind, first, second, expected) => {
      await withApplication(async (id) => {
        await creditService.save(
          { ...application, ...first },
          actors.company,
          id,
        );
        const before = (await creditService.detail(id, actors.company))
          .children[kind];
        expect(before?.id).toBeGreaterThan(0);
        await creditService.save(
          { ...application, ...second },
          actors.company,
          id,
        );
        const after = (await creditService.detail(id, actors.company)).children[
          kind
        ];
        expect(after).toMatchObject({ ...expected, id: before?.id });
      });
    },
  );
});
