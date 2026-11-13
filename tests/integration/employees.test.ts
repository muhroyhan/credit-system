import { randomUUID } from 'node:crypto';
import { employeeDocumentKinds, employeeQuerySchema } from '@credit/contracts';
import { connectDatabase } from '@credit/database/client';
import {
  debitorData,
  debitorFamily,
  debitorFinancial,
  debitorGps,
  debitorOthers,
  debitorSlik,
} from '@credit/database/schema';
import {
  EmployeeConflict,
  EmployeeForbidden,
} from '@server/features/employees/employees.error';
import { createEmployeesService } from '@server/features/employees/employees.service';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { actors } from '../setup/fixtures';
import { withEmployee } from './fixtures/employee';

const documents = Object.fromEntries(
  employeeDocumentKinds.slice(0, 5).map((kind) => [
    kind,
    {
      name: `${kind}.pdf`,
      type: 'application/pdf',
      bytes: new TextEncoder().encode(`%PDF-1.4 ${kind}`),
    },
  ]),
);

describe('EMPLOYEE-I account concurrency, compensation and cleanup', () => {
  it('serializes duplicate account creation into one success and one conflict', async () => {
    const service = createEmployeesService();
    const input = {
      namaLengkap: 'QA Synthetic',
      username: `qa-${randomUUID()}`,
    };
    const results = await Promise.allSettled([
      service.save(input, actors.company),
      service.save(input, actors.company),
    ]);
    const ids = results.flatMap((result) =>
      result.status === 'fulfilled' ? [result.value] : [],
    );
    try {
      expect(ids).toHaveLength(1);
      const rejected = results.find((result) => result.status === 'rejected');
      expect(rejected?.status === 'rejected' && rejected.reason).toBeInstanceOf(
        EmployeeConflict,
      );
    } finally {
      for (const id of ids) {
        await service.remove(id, actors.company);
      }
    }
  });
  it('compensates failed replacement uploads and preserves existing files and SQL keys', async () => {
    const files = new Map<string, Uint8Array>();
    let fail = false;
    await withEmployee(
      async (id, service) => {
        await service.upload(id, documents, actors.company);
        const before = [...files.keys()];
        fail = true;
        await expect(
          service.upload(id, documents, actors.company),
        ).rejects.toThrow('synthetic storage failure');
        expect([...files.keys()]).toEqual(before);
        expect(
          new TextDecoder().decode(
            (await service.document(id, 'slipGajiUrl', actors.company)).bytes,
          ),
        ).toContain('slipGajiUrl');
        expect(
          new TextDecoder().decode(
            (await service.document(id, 'tandaTanganUrl', actors.company))
              .bytes,
          ),
        ).toContain('tandaTanganUrl');
      },
      {
        put: async (key, bytes) => {
          files.set(key, bytes);
          if (fail) {
            throw new Error('synthetic storage failure');
          }
        },
        get: async (key) => files.get(key) ?? null,
        remove: async (key) => {
          files.delete(key);
        },
      },
    );
    expect(files.size).toBe(0);
  });
  it('rejects query filters that attempt to override the HRD tenant', async () => {
    const service = createEmployeesService();
    await expect(
      service.list(
        employeeQuerySchema.parse({ userId: 900002 }),
        actors.company,
      ),
    ).rejects.toBeInstanceOf(EmployeeForbidden);
  });
  it('removes all six child types when deleting an employee', async () => {
    const tables = [
      debitorData,
      debitorFamily,
      debitorFinancial,
      debitorGps,
      debitorOthers,
      debitorSlik,
    ];
    let removedId = 0;
    await withEmployee(async (id) => {
      removedId = id;
      for (const table of tables) {
        await connectDatabase().db.insert(table).values({ debitorId: id });
      }
    });
    for (const table of tables) {
      expect(
        await connectDatabase()
          .db.select()
          .from(table)
          .where(eq(table.debitorId, removedId)),
      ).toHaveLength(0);
    }
  });
});
