# Backend credit-system

- Terapkan tiga layer per fitur: `presentation` (Hono dan validasi), `application` (use case dan aturan bisnis), `data` (Drizzle dan adapter).
- Validasi body, query dan parameter dengan Zod; gunakan kontrak bersama di `packages/contracts`.
- Export tipe Hono RPC tanpa mengekspos koneksi database atau konfigurasi server ke bundle frontend.
- Pertahankan status HRD/BPR, rumus dan urutan business flow di `docs/credit-system/business-flow.md`; catat perubahan perilaku dan logic hole di `docs/credit-system/logic-holes.md`.
- Gunakan MySQL/Drizzle; hindari menganggap relasi sebagai constraint tanpa verifikasi DDL. Gunakan adapter untuk storage, WhatsApp dan PDF.
- Uji service dengan Vitest unit serta route dan repository dengan Vitest integration pada database disposable; lihat `docs/credit-system/testing.md`.
- Daftarkan route Hono melalui `const app = new Hono()` dan pemanggilan `app.get`, `app.use` atau `app.route` terpisah; pertahankan inferensi `AppType` RPC untuk seluruh route.
- Pasang prefix `/api` satu kali. Daftarkan middleware dan handler endpoint dalam pemanggilan yang sama, misalnya `app.get("/programs", identityContext, handler)`, agar path tidak diulang pada `app.use` dan `app.get`.

- Ikuti `docs/credit-system/api-code-standards.md` untuk pola repository, service, route factory, validasi, error, dan tipe RPC. Ambil `const db = connectDatabase().db` sekali di setiap fungsi repository dan gunakan `db` untuk query.
