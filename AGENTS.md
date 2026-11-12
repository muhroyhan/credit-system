# credit-system — instruksi untuk agent

## Tujuan dan batasan

- Bangun sistem kredit monolitik dengan alur bisnis dalam `docs/credit-system/business-flow.md` dan fitur dalam `docs/credit-system/features.md`.
- Pertahankan persetujuan HRD dan BPR, rumus, ketentuan rekening dan dokumen. Jangan menambah alur bisnis tanpa instruksi pengguna.
- Catat logic hole dan dampak kompatibilitas di `docs/credit-system/logic-holes.md`; jangan mengubah perilaku bisnis secara diam-diam.
- Bedakan kebutuhan, rancangan, data yang sudah diverifikasi dan hasil test. Jangan mengklaim script, skema atau fitur telah ada sebelum terbukti.

## Stack dan arsitektur

- TypeScript strict; pnpm workspace, Turborepo, Biome dan runtime Bun.
- Frontend React + Vite + Mantine; backend Hono RPC + Drizzle ORM + MySQL; Zod di frontend dan backend.
- Backend memakai layer `controller`, `service`, `repository`: aturan bisnis di service dan akses data di repository. Simpan langsung di folder fitur sebagai `<feature>.<layer>.ts`, dengan simbol utama `<featureCamelCase><Layer>`. Frontend tetap memakai layer `presentation`, `application`, `data`.
- Import lintas aplikasi/package menggunakan nama workspace `@credit/...` dan ekspor publik; gunakan alias tsconfig `@server/*` atau `@web/*` untuk import dalam aplikasi dan selaraskan resolusi runtime/test.
- Satu deployment monolit: server Hono/Bun melayani API dan aset frontend. Baca `docs/credit-system/architecture.md` untuk batas layer dan struktur target.
- Untuk lingkungan lokal, Docker hanya untuk service database MySQL; semua aplikasi dan tooling dijalankan secara native di host, termasuk server Bun/Hono dan Vite.
- Gunakan `docs/credit-system/api-contract.md` untuk perubahan API dan `docs/credit-system/data-model.md` untuk perubahan model atau relasi. Verifikasi DDL sebelum menetapkan constraint fisik.

## Test dan perintah

- Gunakan Vitest untuk unit dan integration test frontend/backend serta Playwright untuk E2E fullstack. Gunakan data sintetis dan database test terisolasi.
- Cakupan dan acceptance ada di `docs/credit-system/testing.md`; jalankan pemeriksaan yang relevan untuk perubahan dan laporkan hasil aktual.
- Target script workspace: `pnpm dev`, `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm test:unit`, `pnpm test:integration`, `pnpm test:e2e`. Script baru dapat dijalankan setelah didefinisikan dan diverifikasi.
- Migration tidak berjalan otomatis saat build. Jangan menyimpan kredensial atau memakai sistem produksi untuk test.

## Instruksi khusus direktori

- `apps/server/AGENTS.md`: route, service, repository dan integrasi backend.
- `apps/web/AGENTS.md`: komponen, state dan RPC frontend.
- `packages/database/AGENTS.md`: model Drizzle dan migration.
- `tests/e2e/AGENTS.md`: fixture dan skenario Playwright fullstack.
