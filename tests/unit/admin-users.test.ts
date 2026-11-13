import {
  adminCreateSchema,
  adminInputSchema,
  adminListQuerySchema,
  adminRoleSchema,
  adminUpdateSchema,
} from '@credit/contracts';
import { describe, expect, it } from 'vitest';

const input = {
  username: 'synthetic',
  email: 'qa@example.invalid',
  password: 'Synthetic123',
  isActive: true,
  roles: [{ programId: 1, value: 'READ' }],
};

describe('ADMIN-U account and ACL contracts', () => {
  it('accepts create and password-free update with granular permissions', () => {
    expect(adminCreateSchema.parse(input)).toEqual(input);
    const { password: _password, ...update } = input;
    expect(adminUpdateSchema.parse({ ...update, id: 1 })).toMatchObject({
      id: 1,
    });
    expect(adminInputSchema.parse({ ...update, roles: [] }).roles).toEqual([]);
  });
  it.each(['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVAL'])(
    'accepts explicit %s',
    (value) => {
      expect(adminRoleSchema.safeParse({ programId: 1, value }).success).toBe(
        true,
      );
    },
  );
  it.each([
    { username: '' },
    { username: 'x'.repeat(256) },
    { email: 'bad' },
    { password: 'short' },
    { password: 'x'.repeat(73) },
    { password: undefined },
    { isActive: 'true' },
    { roles: [{ programId: 0, value: 'READ' }] },
    { roles: [{ programId: 1, value: 'WRITE' }] },
    {
      roles: [
        { programId: 1, value: 'READ' },
        { programId: 1, value: 'READ' },
      ],
    },
  ])('rejects invalid create %j', (patch) => {
    expect(adminCreateSchema.safeParse({ ...input, ...patch }).success).toBe(
      false,
    );
  });
  it('allows distinct actions on the same program', () => {
    expect(
      adminInputSchema.safeParse({
        ...input,
        roles: [
          { programId: 1, value: 'READ' },
          { programId: 1, value: 'UPDATE' },
        ],
      }).success,
    ).toBe(true);
  });
  it('supplies deterministic listing defaults', () => {
    expect(adminListQuerySchema.parse({})).toEqual({
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortDirection: 'desc',
    });
    expect(
      adminListQuerySchema.parse({ limit: '100', page: '2', active: 'false' }),
    ).toMatchObject({ limit: 100, page: 2, active: 'false' });
  });
  it.each([
    { page: '0' },
    { page: '1.5' },
    { limit: '101' },
    { limit: '-1' },
    { sortBy: 'password' },
    { sortDirection: 'ASC' },
    { active: 'yes' },
  ])('rejects invalid listing %j', (query) => {
    expect(adminListQuerySchema.safeParse(query).success).toBe(false);
  });
});
