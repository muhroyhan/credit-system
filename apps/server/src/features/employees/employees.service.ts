import {
  AccountTypeEnum,
  type EmployeeAccount,
  type EmployeeDocumentKind,
  type EmployeeProfile,
  type EmployeeQuery,
  type ExportTypeEnum,
  employeeDetailSchema,
  employeeDocumentKinds,
  employeeProfileSchema,
  PermissionActionEnum,
} from '@credit/contracts';
import type { DocumentStorage, Identity } from '@server/constant/interface';
import type { DatabaseTransaction } from '@server/constant/type';
import { authService } from '@server/features/auth/auth.service';
import {
  EmployeeConflict,
  EmployeeForbidden,
  EmployeeInvalid,
  EmployeeNotFound,
} from '@server/features/employees/employees.error';
import { employeesRepository } from '@server/features/employees/employees.repository';
import type {
  EmployeeDocumentInput,
  EmployeeWrite,
} from '@server/features/employees/employees.type';
import { validEmployeeDocumentKey } from '@server/features/employees/utils/valid-employee-document-key';
import { createDocumentStorage } from '@server/utils/document-storage';
import { exportFile } from '@server/utils/export-file';
import { hashPassword } from '@server/utils/password';
import { withTransaction } from '@server/utils/transaction';

function requireAction(
  identity: Identity,
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE',
) {
  if (
    identity.type === AccountTypeEnum.Admin &&
    authService.hasAclPermission(identity, `CGP_${action}`)
  ) {
    return;
  }
  if (identity.type === AccountTypeEnum.Company) {
    return;
  }
  if (
    identity.type === AccountTypeEnum.Debitor &&
    (action === PermissionActionEnum.Read ||
      action === PermissionActionEnum.Update)
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
  if (identity.type === AccountTypeEnum.Admin) {
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
    (identity.type !== AccountTypeEnum.Admin &&
      row.userId !== (await scope(identity))) ||
    (identity.type === AccountTypeEnum.Debitor && row.id !== identity.id)
  ) {
    throw new EmployeeForbidden('forbidden');
  }
  const stored = await employeesRepository.profile(id);
  const profile = employeeProfileSchema.partial().parse(
    Object.fromEntries(
      Object.entries({
        ...stored.parent,
        npwp: stored.data?.npwp,
        takehomePay:
          stored.financial?.takehomePay == null
            ? undefined
            : String(stored.financial.takehomePay),
      }).filter(
        ([key, value]) => key in employeeProfileSchema.shape && value != null,
      ),
    ),
  );
  return employeeDetailSchema.parse({
    ...row,
    profile,
    documents: Object.fromEntries(
      employeeDocumentKinds.map((kind) => [
        kind,
        stored.data?.[kind]
          ? `/api/debitor/document?id=${id}&kind=${kind}`
          : null,
      ]),
    ),
  });
}
/** Validates bytes as well as metadata before any file is persisted. */
export function validateEmployeeDocument(file: EmployeeDocumentInput) {
  const bytes = file.bytes;
  const pdf = new TextDecoder().decode(bytes.slice(0, 5)) === '%PDF-';
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v);
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const extension = pdf ? 'pdf' : png ? 'png' : jpeg ? 'jpg' : null;
  if (
    !extension ||
    bytes.length > 10 * 1024 * 1024 ||
    !(pdf ? /\.pdf$/i : png ? /\.png$/i : /\.jpe?g$/i).test(file.name) ||
    file.type !== (pdf ? 'application/pdf' : png ? 'image/png' : 'image/jpeg')
  ) {
    throw new EmployeeInvalid(
      'File harus JPG, PNG atau PDF valid, maksimal 10 MB',
    );
  }
  return extension;
}

/** Coordinates SQL and private storage, compensating new files if SQL fails. */
export function createEmployeesService(
  storage: DocumentStorage = createDocumentStorage(),
) {
  return {
    detail,
    async list(query: EmployeeQuery, identity: Identity) {
      requireAction(identity, 'READ');
      return employeesRepository.list(
        query,
        await scope(identity, query.userId),
        identity.type === AccountTypeEnum.Debitor ? identity.id : undefined,
      );
    },
    async register(input: EmployeeAccount & { slug: string }) {
      const password = await hashPassword(input.password);
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
          {
            namaLengkap: input.namaLengkap,
            username: input.username,
            password,
          },
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
        ? await hashPassword(input.password)
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
          (identity.type !== AccountTypeEnum.Admin && userId !== companyId) ||
          (identity.type === AccountTypeEnum.Debitor && id !== identity.id)
        ) {
          throw new EmployeeForbidden('forbidden');
        }
        if (!(await employeesRepository.lockCompany(userId, tx))) {
          throw new EmployeeNotFound();
        }
        if (
          await employeesRepository.conflict(input.username, userId, id, tx)
        ) {
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
    async saveProfile(
      id: number,
      profile: EmployeeProfile,
      identity: Identity,
    ) {
      requireAction(identity, 'UPDATE');
      return withTransaction(async (tx) => {
        const companyId = await scope(identity, undefined, tx);
        const row = await employeesRepository.account(id, tx);
        if (!row) {
          throw new EmployeeNotFound();
        }
        if (
          (identity.type !== AccountTypeEnum.Admin &&
            row.userId !== companyId) ||
          (identity.type === AccountTypeEnum.Debitor && id !== identity.id)
        ) {
          throw new EmployeeForbidden('forbidden');
        }
        await employeesRepository.saveProfile(
          id,
          profile,
          `${identity.type}:${identity.id}`,
          tx,
        );
        return id;
      });
    },
    async upload(
      id: number,
      files: Partial<Record<EmployeeDocumentKind, EmployeeDocumentInput>>,
      identity: Identity,
    ) {
      requireAction(identity, 'UPDATE');
      const added: string[] = [];
      const replaced: string[] = [];
      try {
        await withTransaction(async (tx) => {
          const companyId = await scope(identity, undefined, tx);
          const row = await employeesRepository.account(id, tx);
          if (!row) {
            throw new EmployeeNotFound();
          }
          if (
            (identity.type !== AccountTypeEnum.Admin &&
              row.userId !== companyId) ||
            (identity.type === AccountTypeEnum.Debitor && id !== identity.id)
          ) {
            throw new EmployeeForbidden('forbidden');
          }
          const old = await employeesRepository.profile(id, tx);
          if (
            !employeeDocumentKinds
              .slice(0, 5)
              .every((kind) => files[kind] || old.data?.[kind])
          ) {
            throw new EmployeeInvalid('Lima dokumen wajib harus diisi');
          }
          const entries = employeeDocumentKinds.flatMap((kind) => {
            const file = files[kind];
            return file
              ? [{ kind, file, extension: validateEmployeeDocument(file) }]
              : [];
          });
          if (!entries.length) {
            throw new EmployeeInvalid('Pilih dokumen');
          }
          const values: Partial<Record<EmployeeDocumentKind, string>> = {};
          for (const { kind, file, extension } of entries) {
            const key = `${id}/${crypto.randomUUID()}.${extension}`;
            added.push(key);
            await storage.put(key, file.bytes);
            values[kind] = key;
            const previous = old.data?.[kind];
            if (previous && validEmployeeDocumentKey(previous)) {
              replaced.push(previous);
            }
          }
          await employeesRepository.saveDocuments(
            id,
            values,
            `${identity.type}:${identity.id}`,
            tx,
          );
        });
      } catch (error) {
        await Promise.allSettled(added.map((key) => storage.remove(key)));
        throw error;
      }
      await Promise.allSettled(replaced.map((key) => storage.remove(key)));
      return id;
    },
    async document(id: number, kind: EmployeeDocumentKind, identity: Identity) {
      await detail(id, identity);
      const stored = await employeesRepository.profile(id);
      const key = stored.data?.[kind];
      if (!key || !validEmployeeDocumentKey(key)) {
        throw new EmployeeNotFound();
      }
      const bytes = await storage.get(key);
      if (!bytes) {
        throw new EmployeeNotFound();
      }
      return { bytes, extension: key.split('.').pop() ?? 'pdf' };
    },
    async exportFile(
      query: EmployeeQuery,
      identity: Identity,
      format: ExportTypeEnum,
    ) {
      requireAction(identity, 'READ');
      const result = await employeesRepository.list(
        query,
        await scope(identity, query.userId),
        identity.type === AccountTypeEnum.Debitor ? identity.id : undefined,
        false,
      );
      return exportFile({
        title: 'Master Karyawan',
        columns: [
          'Nomor induk',
          'Nama',
          'Alias',
          'NIK',
          'Perusahaan',
          'Pengajuan terbuka',
        ],
        values: result.data.map((row) => [
          row.employeeId ?? '',
          row.namaLengkap ?? '',
          row.namaAlias ?? '',
          row.noKtp ?? '',
          row.companyName ?? '',
          String(row.sumPengajuan),
        ]),
        format,
      });
    },
    async remove(id: number, identity: Identity) {
      requireAction(identity, 'DELETE');
      const keys: string[] = [];
      const result = await withTransaction(async (tx) => {
        const companyId = await scope(identity, undefined, tx);
        const row = await employeesRepository.account(id, tx);
        if (!row) {
          throw new EmployeeNotFound();
        }
        if (
          identity.type !== AccountTypeEnum.Admin &&
          row.userId !== companyId
        ) {
          throw new EmployeeForbidden('forbidden');
        }
        if (await employeesRepository.hasCredit(id, tx)) {
          throw new EmployeeConflict('Debitor masih memiliki kredit');
        }
        const stored = await employeesRepository.profile(id, tx);
        for (const kind of employeeDocumentKinds) {
          const key = stored.data?.[kind];
          if (key && validEmployeeDocumentKey(key)) {
            keys.push(key);
          }
        }
        await employeesRepository.remove(id, tx);
        return id;
      });
      await Promise.allSettled(keys.map((key) => storage.remove(key)));
      return result;
    },
  };
}
export const employeesService = createEmployeesService();
