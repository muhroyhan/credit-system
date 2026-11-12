import { and, eq, sql } from 'drizzle-orm';
import { connectDatabase } from './client';
import {
  adminUsers,
  constants,
  countries,
  debitors,
  entityTypes,
  programs,
  roles,
  userBiaya,
  userBungaKredit,
  users,
} from './schema';

const url = process.env.DATABASE_URL;
const password = process.env.SEED_PASSWORD;
if (
  !url ||
  !password ||
  password.length < 8 ||
  process.env.SEED_SYNTHETIC !== 'true'
) {
  throw new Error(
    'Set DATABASE_URL, SEED_PASSWORD (at least 8 characters), and SEED_SYNTHETIC=true',
  );
}
const target = new URL(url);
if (
  !['localhost', '127.0.0.1', '::1'].includes(target.hostname) ||
  !/^\/credit_[a-z0-9_]*(development|test)$/.test(target.pathname)
) {
  throw new Error(
    'Seed requires a local credit_*development or credit_*test database',
  );
}
const { db, pool } = connectDatabase();
try {
  const hash = await Bun.password.hash(password, {
    algorithm: 'bcrypt',
    cost: 10,
  });
  await db.transaction(async (tx) => {
    await tx
      .insert(entityTypes)
      .values({ id: 900001, value: 'PT sintetis' })
      .onDuplicateKeyUpdate({ set: { id: sql`id` } });
    await tx
      .insert(programs)
      .values([
        { id: 900001, abbreviation: 'USA', name: 'Admin User' },
        { id: 900002, abbreviation: 'DKN', name: 'Daftar Kredit Karyawan' },
        {
          id: 900003,
          abbreviation: 'CGP',
          name: 'Master Karyawan dan Pengajuan Kredit',
        },
        { id: 900004, abbreviation: 'USC', name: 'Daftar Perusahaan' },
      ])
      .onDuplicateKeyUpdate({ set: { id: sql`id` } });
    await tx
      .insert(countries)
      .values({ id: 900001, code: 'ID', value: 'Indonesia' })
      .onDuplicateKeyUpdate({ set: { id: sql`id` } });
    await tx
      .insert(constants)
      .values({
        id: 900001,
        type: 'synthetic',
        name: 'contoh',
        value: 'contoh',
      })
      .onDuplicateKeyUpdate({ set: { id: sql`id` } });
    await tx
      .insert(adminUsers)
      .values([
        {
          id: 900001,
          username: 'admin_sintetis',
          email: 'admin@example.invalid',
          password: hash,
          isActive: true,
        },
        {
          id: 900002,
          username: 'admin_baca',
          email: 'admin-baca@example.invalid',
          password: hash,
          isActive: true,
        },
      ])
      .onDuplicateKeyUpdate({ set: { id: sql`id` } });
    const seededRoles = [
      ...['CREATE', 'READ', 'UPDATE', 'DELETE'].flatMap((value) => [
        { adminUserId: 900001, programId: 900001, value },
        { adminUserId: 900001, programId: 900004, value },
        { adminUserId: 900001, programId: 900003, value },
      ]),
      { adminUserId: 900002, programId: 900001, value: 'READ' },
      { adminUserId: 900002, programId: 900004, value: 'READ' },
      { adminUserId: 900002, programId: 900003, value: 'READ' },
    ];
    for (const role of seededRoles) {
      const [existing] = await tx
        .select({ id: roles.id })
        .from(roles)
        .where(
          and(
            eq(roles.adminUserId, role.adminUserId),
            eq(roles.programId, role.programId),
            eq(roles.value, role.value),
          ),
        )
        .limit(1);
      if (!existing) {
        await tx.insert(roles).values(role);
      }
    }
    await tx
      .insert(users)
      .values([
        {
          id: 900001,
          entityTypeId: 900001,
          companyName: 'Perusahaan Sintetis Satu',
          email: 'hrd1@example.invalid',
          username: 'hrd_satu',
          slug: 'sintetis-satu',
          password: hash,
          status: 'active',
        },
        {
          id: 900002,
          entityTypeId: 900001,
          companyName: 'Perusahaan Sintetis Dua',
          email: 'hrd2@example.invalid',
          username: 'hrd_dua',
          slug: 'sintetis-dua',
          password: hash,
          status: 'active',
        },
      ])
      .onDuplicateKeyUpdate({ set: { id: sql`id` } });
    await tx
      .insert(debitors)
      .values([
        {
          id: 900001,
          userId: 900001,
          username: 'debitor_satu',
          password: hash,
          namaLengkap: 'Debitor Sintetis Satu',
        },
        {
          id: 900002,
          userId: 900002,
          username: 'debitor_dua',
          password: hash,
          namaLengkap: 'Debitor Sintetis Dua',
        },
      ])
      .onDuplicateKeyUpdate({ set: { id: sql`id` } });
    await tx
      .insert(userBungaKredit)
      .values([
        {
          id: 900001,
          userId: 900001,
          bungaPercentage: '1',
          jangkaWaktuBulan: '12',
        },
        {
          id: 900002,
          userId: 900002,
          bungaPercentage: '1',
          jangkaWaktuBulan: '12',
        },
      ])
      .onDuplicateKeyUpdate({ set: { id: sql`id` } });
    await tx
      .insert(userBiaya)
      .values([
        {
          id: 900001,
          userId: 900001,
          expenseType: 'administrasi',
          type: '%',
          value: 1,
        },
        {
          id: 900002,
          userId: 900002,
          expenseType: 'administrasi',
          type: '%',
          value: 1,
        },
      ])
      .onDuplicateKeyUpdate({ set: { id: sql`id` } });
  });
  console.log('Synthetic seed completed');
} finally {
  await pool.end();
}
