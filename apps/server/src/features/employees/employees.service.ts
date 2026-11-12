import type { EmployeeAccount, EmployeeQuery } from '@credit/contracts';
import type { Identity } from '@server/constant/interface';
import type { DatabaseTransaction } from '@server/constant/type';
import { authService } from '@server/features/auth/auth.service';
import {
  EmployeeConflict,
  EmployeeForbidden,
  EmployeeNotFound,
} from '@server/features/employees/employees.error';
import { employeesRepository } from '@server/features/employees/employees.repository';
import type { EmployeeWrite } from '@server/features/employees/employees.type';
import { withTransaction } from '@server/utils/transaction';

function requireAction(
  identity: Identity,
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE',
) {
  if (
    identity.type === 'admin' &&
    authService.hasAclPermission(identity, `CGP_${action}`)
  ) {
    return;
  }
  if (identity.type === 'company') {
    return;
  }
  if (
    identity.type === 'debitor' &&
    (action === 'READ' || action === 'UPDATE')
  ) {
    return;
  }
  throw new EmployeeForbidden('forbidden');
}
async function scope(
  identity: Identity,
  userId?: number,
  tx?: DatabaseTransaction,
) {
  if (identity.type === 'admin') {
    return userId;
  }
  const company = await employeesRepository.company(identity.slug, tx);
  if (!company || (userId !== undefined && company.id !== userId)) {
    throw new EmployeeForbidden('forbidden');
  }
  return company.id;
}
async function detail(id: number, identity: Identity) {
  requireAction(identity, 'READ');
  const row = await employeesRepository.account(id);
  if (!row) {
    throw new EmployeeNotFound();
  }
  if (
    (identity.type !== 'admin' && row.userId !== (await scope(identity))) ||
    (identity.type === 'debitor' && row.id !== identity.id)
  ) {
    throw new EmployeeForbidden('forbidden');
  }
  return row;
}
export const employeesService = {
  detail,
  async list(query: EmployeeQuery, identity: Identity) {
    requireAction(identity, 'READ');
    return employeesRepository.list(
      query,
      await scope(identity, query.userId),
      identity.type === 'debitor' ? identity.id : undefined,
    );
  },
  async register(input: EmployeeAccount & { slug: string }) {
    const password = await Bun.password.hash(input.password, {
      algorithm: 'bcrypt',
      cost: 10,
    });
    return withTransaction(async (tx) => {
      const company = await employeesRepository.company(input.slug, tx);
      if (
        !company ||
        !(await employeesRepository.lockCompany(company.id, tx))
      ) {
        throw new EmployeeNotFound();
      }
      if (
        await employeesRepository.conflict(
          input.username,
          company.id,
          undefined,
          tx,
        )
      ) {
        throw new EmployeeConflict('Username sudah digunakan');
      }
      const id = await employeesRepository.save(
        { namaLengkap: input.namaLengkap, username: input.username, password },
        company.id,
        'registration',
        undefined,
        tx,
      );
      if (!id) {
        throw new Error('Gagal membuat debitor');
      }
      return id;
    });
  },
  async save(
    input: EmployeeWrite & { userId?: number },
    identity: Identity,
    id?: number,
  ) {
    requireAction(identity, id ? 'UPDATE' : 'CREATE');
    const password = input.password
      ? await Bun.password.hash(input.password, {
          algorithm: 'bcrypt',
          cost: 10,
        })
      : undefined;
    return withTransaction(async (tx) => {
      const companyId = await scope(identity, input.userId, tx);
      const previous = id ? await employeesRepository.account(id, tx) : null;
      if (id && !previous) {
        throw new EmployeeNotFound();
      }
      const userId = previous?.userId ?? companyId;
      if (
        !userId ||
        (identity.type !== 'admin' && userId !== companyId) ||
        (identity.type === 'debitor' && id !== identity.id)
      ) {
        throw new EmployeeForbidden('forbidden');
      }
      if (!(await employeesRepository.lockCompany(userId, tx))) {
        throw new EmployeeNotFound();
      }
      if (await employeesRepository.conflict(input.username, userId, id, tx)) {
        throw new EmployeeConflict('Username sudah digunakan');
      }
      const savedId = await employeesRepository.save(
        {
          namaLengkap: input.namaLengkap,
          username: input.username,
          ...(password ? { password } : {}),
        },
        userId,
        `${identity.type}:${identity.id}`,
        id,
        tx,
      );
      if (!savedId) {
        throw new Error('Gagal membuat debitor');
      }
      return savedId;
    });
  },
  async remove(id: number, identity: Identity) {
    requireAction(identity, 'DELETE');
    return withTransaction(async (tx) => {
      const companyId = await scope(identity, undefined, tx);
      const row = await employeesRepository.account(id, tx);
      if (!row) {
        throw new EmployeeNotFound();
      }
      if (identity.type !== 'admin' && row.userId !== companyId) {
        throw new EmployeeForbidden('forbidden');
      }
      if (await employeesRepository.hasCredit(id, tx)) {
        throw new EmployeeConflict('Debitor masih memiliki kredit');
      }
      await employeesRepository.remove(id, tx);
      return id;
    });
  },
};
