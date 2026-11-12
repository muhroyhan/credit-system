# Pengembangan lokal

Docker hanya menjalankan MySQL 8.4; Bun/Hono, Vite, migration, seed, runner test dan browser berjalan native di host. Database development dan test harus terpisah; jangan memakai data/rahasia produksi.

## Menjalankan workspace

1. Instal pnpm sesuai packageManager di package.json dan runtime Bun, lalu pnpm install.
2. Salin .env.example ke .env. Ganti MYSQL_ROOT_PASSWORD, DATABASE_URL dan JWT_SECRET; pastikan URL cocok dengan database/port lokal.
3. Jalankan docker compose up -d dan tunggu MySQL siap. Volume mysql_data mempertahankan data; jangan menghapusnya untuk reset rutin.
4. Jalankan pnpm db:migrate secara eksplisit, lalu seed bila diperlukan. Migration tidak otomatis saat build/start.
5. pnpm dev menjalankan server dan Vite; proxy /api menuju localhost:3000. pnpm build lalu pnpm start menjalankan hasil monolit. Port server dapat diatur melalui PORT.

Bun memuat .env dari working directory. Untuk perintah Node seperti Vitest/Playwright, sediakan variabel yang diperlukan melalui environment shell; jangan mengandalkan semua runner memuat .env secara identik.

## Database dan seed

- pnpm db:generate menghasilkan SQL dari schema; review sebelum pnpm db:migrate. DDL dan perubahan data tercatat pada data-model.md.
- pnpm db:seed memerlukan DATABASE_URL lokal bernama credit_*development atau credit_*test, SEED_SYNTHETIC=true, SEED_PASSWORD minimal delapan karakter. Runner memakai Bun/Drizzle dan hash bcrypt.
- Dataset berisi dua tenant, admin_sintetis/admin_baca, hrd_satu/hrd_dua dan debitor_satu/debitor_dua. Akun tenant memakai slug sintetis-satu/sintetis-dua. Periksa seed.ts untuk data persisnya; bukan akun produksi.
- ID sintetis eksplisit mulai 900001 untuk entitas referensi/akun; role dicegah duplikat berdasarkan admin/program/aksi. Seed ulang tidak mengganti password/data yang sudah ada. Gunakan database khusus seed.
- Untuk test, siapkan MySQL disposable dan set DATABASE_URL ke database credit_*test, JWT_SECRET dan SEED_PASSWORD. PLAYWRIGHT_BROWSER_PATH opsional untuk executable browser lokal. Cleanup container test setelah runner selesai; jangan menghentikan database development.

## Perintah yang tersedia

| Tujuan | Perintah |
| --- | --- |
| Aplikasi | pnpm dev, pnpm build, pnpm start |
| Pemeriksaan statis | pnpm typecheck, pnpm lint, pnpm format |
| Test | pnpm test:unit, pnpm test:integration, pnpm test:e2e |
| Database | pnpm db:generate, pnpm db:migrate, pnpm db:seed |

Cakupan/jadwal test bukan di runbook ini; ikuti testing.md dan development-plan.md dari peta sumber.
