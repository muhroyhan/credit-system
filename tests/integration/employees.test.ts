import {
  employeeDocumentKinds,
  employeeProfileFields,
  employeeProfileSchema,
} from '@credit/contracts';
import { closeDatabase, connectDatabase } from '@credit/database/client';
import {
  debitorData,
  debitorFamily,
  debitorFinancial,
  debitorGps,
  debitorOthers,
  debitorSlik,
} from '@credit/database/schema';
import type { DocumentStorage, Identity } from '@server/constant/interface';
import {
  EmployeeConflict,
  EmployeeForbidden,
} from '@server/features/employees/employees.error';
import { createEmployeesService } from '@server/features/employees/employees.service';
import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';

const url = process.env.DATABASE_URL;
if (
  url &&
  (!['localhost', '127.0.0.1', '::1'].includes(new URL(url).hostname) ||
    !/^\/credit_[a-z0-9_]*test$/.test(new URL(url).pathname))
) {
  throw new Error('Isolated test database required');
}
afterAll(async () => {
  if (url) {
    await closeDatabase();
  }
});
const company: Identity = {
  id: 900001,
  type: 'company',
  slug: 'sintetis-satu',
  permissions: [],
};
const other: Identity = {
  id: 900002,
  type: 'company',
  slug: 'sintetis-dua',
  permissions: [],
};
describe.skipIf(!url)(
  'P05 SQL rollback and private storage compensation',
  () => {
    it('serializes account conflicts, rolls back profile writes and cleans all child rows', async () => {
      const files = new Map<string, Uint8Array>();
      let fail = false;
      const storage: DocumentStorage = {
        async put(key, bytes) {
          files.set(key, bytes);
          if (fail && files.size > 5) {
            throw new Error('Storage failed');
          }
        },
        async get(key) {
          return files.get(key) ?? null;
        },
        async remove(key) {
          files.delete(key);
        },
      };
      const service = createEmployeesService(storage);
      const account = {
        namaLengkap: 'P05 integration',
        username: 'p05-integration',
      };
      const race = await Promise.allSettled([
        service.save(account, company),
        service.save(account, company),
      ]);
      const ids = race.flatMap((result) =>
        result.status === 'fulfilled' ? [result.value] : [],
      );
      if (ids.length !== 1) {
        for (const duplicate of ids) {
          await service.remove(duplicate, company);
        }
      }
      expect(ids).toHaveLength(1);
      expect(
        race.filter((result) => result.status === 'rejected'),
      ).toHaveLength(1);
      const id = ids[0];
      if (!id) {
        throw new Error('Expected created employee');
      }
      try {
        await expect(service.save(account, company)).rejects.toBeInstanceOf(
          EmployeeConflict,
        );
        await expect(service.detail(id, other)).rejects.toBeInstanceOf(
          EmployeeForbidden,
        );
        await expect(
          service.list(
            {
              page: 1,
              limit: 20,
              sortBy: 'id',
              sortDirection: 'asc',
              userId: 900002,
            },
            company,
          ),
        ).rejects.toBeInstanceOf(EmployeeForbidden);
        const profile = employeeProfileSchema.parse({
          ...Object.fromEntries(
            employeeProfileFields.map(([key]) => [
              key,
              key === 'tanggalLahir' ? '1990-01-02' : 'Synthetic',
            ]),
          ),
          namaAlias: 'alias-p05',
          noHp: '08123',
          noTelp: '',
          pekerjaan: '',
          pendidikan: '',
          kewarganegaraan: '',
          npwp: '',
          takehomePay: '5000000',
        });
        await Promise.all([
          service.saveProfile(id, profile, company),
          service.saveProfile(id, profile, company),
        ]);
        const dbBefore = connectDatabase().db;
        expect(
          await dbBefore
            .select({ id: debitorData.id })
            .from(debitorData)
            .where(eq(debitorData.debitorId, id)),
        ).toHaveLength(1);
        expect(
          await dbBefore
            .select({ id: debitorFinancial.id })
            .from(debitorFinancial)
            .where(eq(debitorFinancial.debitorId, id)),
        ).toHaveLength(1);

        await expect(
          service.saveProfile(
            id,
            { ...profile, namaLengkap: 'Must rollback', npwp: 'x'.repeat(256) },
            company,
          ),
        ).rejects.toThrow();
        expect((await service.detail(id, company)).profile).toMatchObject({
          namaLengkap: 'Synthetic',
          noHp: '08123',
          takehomePay: '5000000',
          tanggalLahir: '1990-01-02',
        });
        const input = Object.fromEntries(
          employeeDocumentKinds.slice(0, 5).map((kind) => [
            kind,
            {
              name: `${kind}.pdf`,
              type: 'application/pdf',
              bytes: new TextEncoder().encode(`%PDF-1.4 ${kind}`),
            },
          ]),
        );
        await service.upload(id, input, company);
        const slip = await service.document(id, 'slipGajiUrl', company);
        const signature = await service.document(id, 'tandaTanganUrl', company);
        expect(new TextDecoder().decode(slip.bytes)).toContain('slipGajiUrl');
        expect(new TextDecoder().decode(signature.bytes)).toContain(
          'tandaTanganUrl',
        );
        expect(files.size).toBe(5);
        fail = true;
        await expect(service.upload(id, input, company)).rejects.toThrow(
          'Storage failed',
        );
        expect(files.size).toBe(5);
        expect(
          new TextDecoder().decode(
            (await service.document(id, 'slipGajiUrl', company)).bytes,
          ),
        ).toContain('slipGajiUrl');
        const db = connectDatabase().db;
        for (const table of [
          debitorFamily,
          debitorGps,
          debitorOthers,
          debitorSlik,
        ]) {
          await db.insert(table).values({ debitorId: id });
        }
      } finally {
        await service.remove(id, company);
      }
      expect(files.size).toBe(0);
      const db = connectDatabase().db;
      for (const table of [
        debitorData,
        debitorFamily,
        debitorFinancial,
        debitorGps,
        debitorOthers,
        debitorSlik,
      ]) {
        expect(
          await db
            .select({ id: table.id })
            .from(table)
            .where(eq(table.debitorId, id)),
        ).toHaveLength(0);
      }
    });
  },
);
