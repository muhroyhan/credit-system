import { randomUUID } from 'node:crypto';
import { adminListQuerySchema } from '@credit/contracts';
import {
  AdminConflict,
  AdminNotFound,
} from '@server/features/admin-users/admin-users.error';
import { adminUsersService } from '@server/features/admin-users/admin-users.service';
import { describe, expect, it } from 'vitest';

function input() {
  const username = `qa-${randomUUID()}`;
  return {
    username,
    email: `${username}@example.invalid`,
    isActive: true,
    roles: [{ programId: 900001, value: 'READ' as const }],
  };
}
async function withAdmin(
  run: (id: number, value: ReturnType<typeof input>) => Promise<void>,
) {
  const value = input();
  const id = await adminUsersService.save(value, 'qa');
  if (!id) {
    throw new Error('Missing synthetic admin');
  }
  try {
    await run(id, value);
  } finally {
    await adminUsersService.remove(id);
  }
}

describe('ADMIN-I service and SQL roles', () => {
  it('creates, lists and reads a public DTO with roles', async () => {
    await withAdmin(async (id, value) => {
      expect(await adminUsersService.detail(id)).toMatchObject({
        ...value,
        id,
      });
      const result = await adminUsersService.list(
        adminListQuerySchema.parse({ username: value.username }),
      );
      expect(result.count).toBe(1);
      expect(result.data[0]).toMatchObject({ id, username: value.username });
      expect(JSON.stringify(result)).not.toContain('password');
    });
  });
  it.each(['username', 'email'] as const)(
    'rejects conflicting %s',
    async (field) => {
      await withAdmin(async (_id, value) => {
        await expect(
          adminUsersService.save({ ...input(), [field]: value[field] }, 'qa'),
        ).rejects.toBeInstanceOf(AdminConflict);
      });
    },
  );
  it('rejects nonexistent programs and retains prior account and roles', async () => {
    await withAdmin(async (id, value) => {
      const before = await adminUsersService.detail(id);
      await expect(
        adminUsersService.save(
          {
            ...value,
            username: 'must-rollback',
            roles: [{ programId: 2147483647, value: 'UPDATE' }],
          },
          'qa',
          id,
        ),
      ).rejects.toBeInstanceOf(AdminConflict);
      expect(await adminUsersService.detail(id)).toEqual(before);
    });
  });
  it('replaces role configuration and removes all roles with an empty array', async () => {
    await withAdmin(async (id, value) => {
      await adminUsersService.save(
        { ...value, roles: [{ programId: 900003, value: 'READ' }] },
        'qa',
        id,
      );
      expect((await adminUsersService.detail(id))?.roles).toEqual([
        { programId: 900003, value: 'READ' },
      ]);
      await adminUsersService.save({ ...value, roles: [] }, 'qa', id);
      expect((await adminUsersService.detail(id))?.roles).toEqual([]);
    });
  });
  it('deletes account and roles and reports a second delete as absent', async () => {
    await withAdmin(async (id) => {
      expect(await adminUsersService.remove(id)).toBe(true);
      expect(await adminUsersService.detail(id)).toBeNull();
      expect(await adminUsersService.remove(id)).toBe(false);
    });
  });
  it('rejects updates to absent accounts', async () => {
    await expect(
      adminUsersService.save(input(), 'qa', 2147483647),
    ).rejects.toBeInstanceOf(AdminNotFound);
  });
});
