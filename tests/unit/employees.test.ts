import {
  employeeProfileSchema,
  employeeRegisterSchema,
} from '@credit/contracts';
import { EmployeeInvalid } from '@server/features/employees/employees.error';
import { validateEmployeeDocument } from '@server/features/employees/employees.service';
import { validEmployeeDocumentKey } from '@server/features/employees/utils/valid-employee-document-key';
import { crudaAccess } from '@web/utils/cruda';
import { describe, expect, it } from 'vitest';
import { profile } from '../setup/fixtures';

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

describe('EMPLOYEE-U profile and file partitions', () => {
  it('accepts a complete profile and unsigned income boundaries', () => {
    expect(employeeProfileSchema.parse(profile)).toEqual(profile);
    for (const takehomePay of ['0', '4294967295']) {
      expect(
        employeeProfileSchema.safeParse({ ...profile, takehomePay }).success,
      ).toBe(true);
    }
  });
  it.each([
    'employeeId',
    'noKtp',
    'namaLengkap',
    'jenisKelamin',
    'agama',
    'tempatLahir',
    'tanggalLahir',
    'statusMarital',
    'namaIbuKandung',
    'alamatKtp',
    'provinsi',
    'kota',
    'kecamatan',
    'kelurahanDesa',
    'kodePos',
    'alamatDomisili',
    'takehomePay',
  ])('rejects missing required profile %s', (field) => {
    expect(
      employeeProfileSchema.safeParse({ ...profile, [field]: '' }).success,
    ).toBe(false);
  });
  it.each(['-1', '0.5', '1.000', '4294967296', 'NaN'])(
    'rejects income %s',
    (takehomePay) => {
      expect(
        employeeProfileSchema.safeParse({ ...profile, takehomePay }).success,
      ).toBe(false);
    },
  );
  it.each([
    ['document.PDF', 'application/pdf', [37, 80, 68, 70, 45], 'pdf'],
    ['document.png', 'image/png', [137, 80, 78, 71, 13, 10, 26, 10], 'png'],
    ['document.jpeg', 'image/jpeg', [255, 216, 255], 'jpg'],
    ['document.JPG', 'image/jpeg', [255, 216, 255], 'jpg'],
  ] as const)(
    'accepts matching signature for %s',
    (name, type, signature, extension) => {
      expect(
        validateEmployeeDocument({
          name,
          type,
          bytes: new Uint8Array(signature),
        }),
      ).toBe(extension);
    },
  );
  it('accepts exactly 10 MB and rejects mismatched MIME and extension', () => {
    const bytes = new Uint8Array(10 * 1024 * 1024);
    bytes.set([37, 80, 68, 70, 45]);
    expect(
      validateEmployeeDocument({
        name: 'doc.pdf',
        type: 'application/pdf',
        bytes,
      }),
    ).toBe('pdf');
    for (const metadata of [
      { name: 'doc.png', type: 'application/pdf' },
      { name: 'doc.pdf', type: 'image/png' },
    ]) {
      expect(() => validateEmployeeDocument({ ...metadata, bytes })).toThrow(
        EmployeeInvalid,
      );
    }
  });
  it.each([
    '../secret.pdf',
    '/1/file.pdf',
    'https://example.invalid/doc.pdf',
    '1/not-a-uuid.pdf',
    '1/00000000-0000-4000-8000-000000000000.exe',
  ])('rejects untrusted stored document key %s', (key) => {
    expect(validEmployeeDocumentKey(key)).toBe(false);
  });
  it('accepts service-generated private document keys', () => {
    expect(
      validEmployeeDocumentKey('1/00000000-0000-4000-8000-000000000000.pdf'),
    ).toBe(true);
  });
});
