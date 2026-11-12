import type { Session } from '@web/constant/type';
import { crudaAccess } from '@web/utils/cruda';
import { describe, expect, it } from 'vitest';

const session = (type: Session['type'], roles: unknown): Session => ({
  authToken: 'synthetic',
  type,
  userData: { id: 1, roles },
});
describe('CRUDA mirrors current Admin User API permissions', () => {
  it('allows only explicitly granted permissions', () => {
    expect(
      crudaAccess(session('admin', [{ program: 'USA', value: 'READ' }]), 'USA'),
    ).toEqual({
      create: false,
      read: true,
      update: false,
      delete: false,
      approve: false,
    });
    expect(
      crudaAccess(
        session('admin', [{ program: 'USA', value: 'WRITE' }]),
        'USA',
      ),
    ).toEqual({
      create: false,
      read: false,
      update: false,
      delete: false,
      approve: false,
    });
  });
  it('respects individual actions and explicit approval', () => {
    expect(
      crudaAccess(
        session('admin', [
          { program: 'USA', value: 'CREATE' },
          { program: 'USA', value: 'APPROVAL' },
        ]),
        'USA',
      ),
    ).toEqual({
      create: true,
      read: false,
      update: false,
      delete: false,
      approve: true,
    });
  });
  it('denies other programs, tenant actors and malformed roles', () => {
    for (const candidate of [
      null,
      session('admin', [{ program: 'OTHER', value: 'UPDATE' }]),
      session('company', [{ program: 'USA', value: 'WRITE' }]),
      session('debitor', []),
      session('admin', [null, 5, {}, { program: 'USA', value: 'UNKNOWN' }]),
    ]) {
      expect(
        Object.values(crudaAccess(candidate, 'USA')).every((v) => !v),
      ).toBe(true);
    }
  });
});
