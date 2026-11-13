import { randomUUID } from 'node:crypto';
import type { DocumentStorage } from '@server/constant/interface';
import { createEmployeesService } from '@server/features/employees/employees.service';
import { actors } from '../../setup/fixtures';

/** Keeps storage in memory and guarantees cleanup for a scenario-owned employee. */
export async function withEmployee(
  run: (
    id: number,
    service: ReturnType<typeof createEmployeesService>,
    files: Map<string, Uint8Array>,
  ) => Promise<void>,
  supplied?: DocumentStorage,
) {
  const files = new Map<string, Uint8Array>();
  const service = createEmployeesService(
    supplied ?? {
      put: async (key, bytes) => {
        files.set(key, bytes);
      },
      get: async (key) => files.get(key) ?? null,
      remove: async (key) => {
        files.delete(key);
      },
    },
  );
  const id = await service.save(
    { namaLengkap: 'QA Synthetic', username: `qa-${randomUUID()}` },
    actors.company,
  );
  try {
    await run(id, service, files);
  } finally {
    await service.remove(id, actors.company);
  }
}
