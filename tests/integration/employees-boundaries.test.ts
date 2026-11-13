import { employeeDocumentKinds } from '@credit/contracts';
import { connectDatabase } from '@credit/database/client';
import { debitorData, debitorFinancial } from '@credit/database/schema';
import {
  EmployeeForbidden,
  EmployeeInvalid,
  EmployeeNotFound,
} from '@server/features/employees/employees.error';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { actors, profile } from '../setup/fixtures';
import { withEmployee } from './fixtures/employee';

const document = {
  name: 'synthetic.pdf',
  type: 'application/pdf',
  bytes: new TextEncoder().encode('%PDF-1.4 synthetic'),
};
const documents = Object.fromEntries(
  employeeDocumentKinds.slice(0, 5).map((kind) => [kind, document]),
);

describe('EMPLOYEE-I isolated profile and document cases', () => {
  it('saves profile data without exposing password or losing string zeroes', async () => {
    await withEmployee(async (id, service) => {
      await service.saveProfile(id, profile, actors.company);
      const detail = await service.detail(id, actors.company);
      expect(detail.profile).toEqual(profile);
      expect(detail).not.toHaveProperty('password');
    });
  });
  it('upserts concurrent profiles into one row per child table', async () => {
    await withEmployee(async (id, service) => {
      await Promise.all([
        service.saveProfile(id, profile, actors.company),
        service.saveProfile(id, profile, actors.company),
      ]);
      const db = connectDatabase().db;
      for (const table of [debitorData, debitorFinancial]) {
        expect(
          await db.select().from(table).where(eq(table.debitorId, id)),
        ).toHaveLength(1);
      }
    });
  });
  it('rolls back parent changes after a child SQL failure', async () => {
    await withEmployee(async (id, service) => {
      await service.saveProfile(id, profile, actors.company);
      await expect(
        service.saveProfile(
          id,
          { ...profile, namaLengkap: 'Must rollback', npwp: 'x'.repeat(256) },
          actors.company,
        ),
      ).rejects.toThrow();
      expect((await service.detail(id, actors.company)).profile).toEqual(
        profile,
      );
    });
  });
  it.each(['otherCompany', 'otherCustomer'] as const)(
    'denies profile and document writes from %s',
    async (actor) => {
      await withEmployee(async (id, service, files) => {
        await expect(
          service.saveProfile(id, profile, actors[actor]),
        ).rejects.toBeInstanceOf(EmployeeForbidden);
        await expect(
          service.upload(id, documents, actors[actor]),
        ).rejects.toBeInstanceOf(EmployeeForbidden);
        expect(files.size).toBe(0);
      });
    },
  );
  it.each(employeeDocumentKinds.slice(0, 5))(
    'requires first-time document %s before persisting any files',
    async (missing) => {
      await withEmployee(async (id, service, files) => {
        const incomplete = Object.fromEntries(
          Object.entries(documents).filter(([kind]) => kind !== missing),
        );
        await expect(
          service.upload(id, incomplete, actors.company),
        ).rejects.toBeInstanceOf(EmployeeInvalid);
        expect(files.size).toBe(0);
      });
    },
  );
  it('replaces one document, deletes the old file and preserves other documents', async () => {
    await withEmployee(async (id, service, files) => {
      await service.upload(id, documents, actors.company);
      const before = [...files.keys()];
      const replacement = {
        ...document,
        bytes: new TextEncoder().encode('%PDF-1.4 replacement'),
      };
      await service.upload(id, { slipGajiUrl: replacement }, actors.company);
      expect(files.size).toBe(5);
      expect(before.filter((key) => !files.has(key))).toHaveLength(1);
      expect(
        (await service.document(id, 'slipGajiUrl', actors.company)).bytes,
      ).toEqual(replacement.bytes);
      expect(
        (await service.document(id, 'tandaTanganUrl', actors.company)).bytes,
      ).toEqual(document.bytes);
    });
  });
  it('returns not found for a document that is not stored', async () => {
    await withEmployee(async (id, service) => {
      await expect(
        service.document(id, 'fotoUrl', actors.company),
      ).rejects.toBeInstanceOf(EmployeeNotFound);
    });
  });
});
