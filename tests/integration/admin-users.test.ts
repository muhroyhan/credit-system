import { closeDatabase } from '@credit/database/client';
import { testDatabaseUrl } from '@credit/test-utils/database';
import { AdminConflict } from '@server/features/admin-users/admin-users.error';
import { adminUsersService } from '@server/features/admin-users/admin-users.service';
import { afterAll, describe, expect, it } from 'vitest';

const url = testDatabaseUrl(process.env.DATABASE_URL);
afterAll(async () => {
  if (url) {
    await closeDatabase();
  }
});
describe.skipIf(!url)('administrator service', () => {
  it('stores roles atomically and handles conflicts and deletion', async () => {
    const input = {
      username: 'p03_integration',
      email: 'p03-integration@example.invalid',

      isActive: true,
      roles: [{ programId: 900001, value: 'READ' as const }],
    };
    const id = await adminUsersService.save(input, 'test');
    try {
      await expect(
        adminUsersService.save(input, 'test'),
      ).rejects.toBeInstanceOf(AdminConflict);
      await expect(
        adminUsersService.save(
          { ...input, roles: [{ programId: 123456, value: 'UPDATE' }] },
          'test',
          id,
        ),
      ).rejects.toBeInstanceOf(AdminConflict);
      expect(await adminUsersService.detail(id)).toMatchObject({
        username: input.username,
        roles: [{ programId: 900001, value: 'READ' }],
      });
      await adminUsersService.save({ ...input, roles: [] }, 'test', id);
      expect(await adminUsersService.detail(id)).toMatchObject({
        roles: [],
      });
    } finally {
      expect(await adminUsersService.remove(id)).toBe(true);
    }
    expect(await adminUsersService.detail(id)).toBeNull();
  });
});
