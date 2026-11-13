import { closeDatabase, connectDatabase } from '@credit/database/client';
import { countries } from '@credit/database/schema';
import { testDatabaseUrl } from '@credit/test-utils/database';
import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';

const url = testDatabaseUrl(process.env.DATABASE_URL);
afterAll(async () => {
  if (url) {
    await closeDatabase();
  }
});

describe.skipIf(!url)('database-managed audit timestamps', () => {
  it('installs automatic defaults and updates on every audit column', async () => {
    const { pool } = connectDatabase();
    const [rows] = await pool.query(
      `SELECT TABLE_NAME, COLUMN_NAME, COLUMN_DEFAULT, EXTRA FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME <> '__drizzle_migrations' AND COLUMN_NAME IN ('created_at', 'updated_at')`,
    );
    const columns = rows as Array<{ COLUMN_DEFAULT: string; EXTRA: string }>;
    expect(columns.length).toBeGreaterThan(0);
    for (const row of columns) {
      expect(String(row.COLUMN_DEFAULT).toLowerCase()).toContain(
        'current_timestamp',
      );
      expect(String(row.EXTRA).toLowerCase()).toContain(
        'on update current_timestamp',
      );
    }
    expect(columns.length).toBe(48);
  });

  it('updates both dates on real changes from raw SQL and Drizzle', async () => {
    const { db, pool } = connectDatabase();
    const [result] = await db
      .insert(countries)
      .values({ code: 'T0', value: 'audit timestamp test' })
      .$returningId();
    if (!result) {
      throw new Error('Test country was not inserted');
    }
    try {
      await pool.execute(
        "UPDATE country SET created_at = '2001-01-01 00:00:00', updated_at = '2001-01-01 00:00:00' WHERE id = ?",
        [result.id],
      );
      await pool.execute(
        "UPDATE country SET value = 'raw update' WHERE id = ?",
        [result.id],
      );
      const [raw] = await pool.query(
        'SELECT created_at, updated_at FROM country WHERE id = ?',
        [result.id],
      );
      expect(
        new Date(
          (raw as Array<{ created_at: Date }>)[0]?.created_at ?? 0,
        ).getFullYear(),
      ).toBeGreaterThan(2001);
      expect(
        new Date(
          (raw as Array<{ updated_at: Date }>)[0]?.updated_at ?? 0,
        ).getFullYear(),
      ).toBeGreaterThan(2001);
      await pool.execute(
        "UPDATE country SET created_at = '2002-01-01 00:00:00', updated_at = '2002-01-01 00:00:00' WHERE id = ?",
        [result.id],
      );
      await db
        .update(countries)
        .set({ value: 'drizzle update' })
        .where(eq(countries.id, result.id));
      const [updated] = await pool.query(
        'SELECT created_at, updated_at FROM country WHERE id = ?',
        [result.id],
      );
      expect(
        new Date(
          (updated as Array<{ created_at: Date }>)[0]?.created_at ?? 0,
        ).getFullYear(),
      ).toBeGreaterThan(2002);
      expect(
        new Date(
          (updated as Array<{ updated_at: Date }>)[0]?.updated_at ?? 0,
        ).getFullYear(),
      ).toBeGreaterThan(2002);
    } finally {
      await pool.execute('DELETE FROM country WHERE id = ?', [result.id]);
    }
  });
});
