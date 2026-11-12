import {
  belongsToCompany,
  hasAclPermission,
  hasProgramPermission,
  type Identity,
} from '@credit/server/identity';
import { describe, expect, it } from 'vitest';

const admin: Identity = {
  id: 1,
  slug: 'admin',
  type: 'admin',
  permissions: [
    { program: 'USA', value: 'READ' },
    { program: 'CGP', value: 'READ' },
  ],
};
describe('program and tenant access', () => {
  it('retains exact program checks', () => {
    expect(hasProgramPermission(admin, 'USA', 'READ')).toBe(true);
    expect(hasProgramPermission(admin, 'USA', 'CREATE')).toBe(false);
  });
  it('scopes non-admin identities to their tenant', () => {
    const user: Identity = {
      id: 2,
      type: 'company',
      slug: 'tenant-a',
      permissions: [],
    };
    expect(belongsToCompany(user, 'tenant-a')).toBe(true);
    expect(belongsToCompany(user, 'tenant-b')).toBe(false);
    expect(hasAclPermission(user, 'USA_READ')).toBe(false);
  });
});

describe('granular ACL', () => {
  it('checks each action and requires explicit approval', () => {
    const identity: Identity = {
      ...admin,
      permissions: [
        { program: 'USA', value: 'CREATE' },
        { program: 'USA', value: 'APPROVAL' },
        { program: 'USC', value: 'DELETE' },
      ],
    };
    expect(hasAclPermission(identity, 'USA_CREATE')).toBe(true);
    expect(hasAclPermission(identity, 'USA_UPDATE')).toBe(false);
    expect(hasAclPermission(identity, 'USA_READ')).toBe(false);
    expect(hasAclPermission(identity, 'USA_APPROVAL')).toBe(true);
    expect(hasAclPermission(identity, 'USC_DELETE')).toBe(true);
    expect(hasAclPermission(identity, 'USC_APPROVAL')).toBe(false);
    expect(hasAclPermission(identity, 'USA_WRITE')).toBe(false);
    expect(hasAclPermission(identity, 'usa_CREATE')).toBe(false);
  });
});
