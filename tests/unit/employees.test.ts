import {
  employeeProfileSchema,
  employeeRegisterSchema,
} from '@credit/contracts';
import { EmployeeInvalid } from '@server/features/employees/employees.error';
import { validateEmployeeDocument } from '@server/features/employees/employees.service';
import { crudaAccess } from '@web/utils/cruda';
import { describe, expect, it } from 'vitest';

describe('P05 account, profile and document boundaries', () => {
  it('rejects internal registration fields and validates passwords repeatedly without regex state', () => {
    const value = {
      slug: 'sintetis-satu',
      namaLengkap: 'Synthetic',
      username: 'synthetic.user',
      password: 'Secret123',
    };
    for (let index = 0; index < 3; index++) {
      expect(employeeRegisterSchema.safeParse(value).success).toBe(true);
    }
    expect(
      employeeRegisterSchema.safeParse({ ...value, userId: 2 }).success,
    ).toBe(false);
    expect(
      employeeRegisterSchema.safeParse({ ...value, password: 'weakpass' })
        .success,
    ).toBe(false);
    expect(
      employeeRegisterSchema.safeParse({ ...value, username: 'space name' })
        .success,
    ).toBe(false);
  });
  it('preserves telephone leading zeroes and calendar dates, rejects impossible dates and income overflow', () => {
    expect(employeeProfileSchema.shape.noHp.parse('08123456789')).toBe(
      '08123456789',
    );
    expect(employeeProfileSchema.shape.tanggalLahir.parse('1995-07-21')).toBe(
      '1995-07-21',
    );
    expect(
      employeeProfileSchema.shape.tanggalLahir.safeParse('2025-02-30').success,
    ).toBe(false);
    expect(
      employeeProfileSchema.shape.takehomePay.safeParse('4294967296').success,
    ).toBe(false);
  });
  it('checks file signature rather than trusting extension or MIME', () => {
    const file = {
      name: 'slip.pdf',
      type: 'application/pdf',
      bytes: new TextEncoder().encode('%PDF-1.4 synthetic slip'),
    };
    expect(validateEmployeeDocument(file)).toBe('pdf');
    expect(() =>
      validateEmployeeDocument({
        ...file,
        bytes: new TextEncoder().encode('fake'),
      }),
    ).toThrow(EmployeeInvalid);
    expect(() =>
      validateEmployeeDocument({ ...file, name: 'file.exe' }),
    ).toThrow(EmployeeInvalid);
    expect(() =>
      validateEmployeeDocument({ ...file, bytes: new Uint8Array() }),
    ).toThrow(EmployeeInvalid);
    const bytes = new Uint8Array(10 * 1024 * 1024 + 1);
    bytes.set(file.bytes);
    expect(() => validateEmployeeDocument({ ...file, bytes })).toThrow(
      EmployeeInvalid,
    );
  });
  it('grants company CRUD and debitor self read/update only for CGP', () => {
    const session = {
      authToken: 'synthetic',
      type: 'debitor' as const,
      userData: { id: 1 },
    };
    expect(crudaAccess(session, 'CGP')).toEqual({
      create: false,
      read: true,
      update: true,
      delete: false,
      approve: false,
    });
    expect(crudaAccess({ ...session, type: 'company' }, 'CGP').delete).toBe(
      true,
    );
    expect(crudaAccess(session, 'USA').read).toBe(false);
  });
});
