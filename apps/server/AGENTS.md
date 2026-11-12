# Backend credit-system

- Terapkan tiga layer backend: `controller` (Hono, middleware dan validasi), `service` (use case dan aturan bisnis), `repository` (Drizzle dan adapter). Simpan langsung di folder fitur sebagai `<feature>.controller.ts`, `<feature>.service.ts`, dan `<feature>.repository.ts`; simbol utama mengikuti `<featureCamelCase>Controller`, `<featureCamelCase>Service`, dan `<featureCamelCase>Repository`. Jangan buat subfolder layer.
- Simpan deklarasi type dan interface setiap fitur dalam `<feature>.type.ts` di folder fitur yang sama; gunakan `import type` untuk konsumen tipe. Kontrak Zod bersama tetap di `packages/contracts`.
- Validasi body, query dan parameter dengan Zod; gunakan kontrak bersama di `packages/contracts`.
- Export tipe Hono RPC tanpa mengekspos koneksi database atau konfigurasi server ke bundle frontend.
- Pertahankan status HRD/BPR, rumus dan urutan business flow di `docs/credit-system/business-flow.md`; catat perubahan perilaku dan logic hole di `docs/credit-system/logic-holes.md`.
- Gunakan MySQL/Drizzle; hindari menganggap relasi sebagai constraint tanpa verifikasi DDL. Gunakan adapter untuk storage, WhatsApp dan PDF.
- Uji service dengan Vitest unit serta route dan repository dengan Vitest integration pada database disposable; lihat `docs/credit-system/testing.md`.
- Daftarkan route Hono melalui `const app = new Hono()` dan pemanggilan `app.get`, `app.use` atau `app.route` terpisah; pertahankan inferensi `AppType` RPC untuk seluruh route.
- Pasang prefix `/api` satu kali. Daftarkan middleware dan handler endpoint dalam pemanggilan yang sama, misalnya `app.get("/programs", identityContext, handler)`, agar path tidak diulang pada `app.use` dan `app.get`.

- Ikuti `docs/credit-system/api-code-standards.md` untuk pola repository, service, route factory, validasi, error, dan tipe RPC. Ambil `const db = connectDatabase().db` sekali di setiap fungsi repository dan gunakan `db` untuk query.

- Urutan akses dan import wajib `global routes → controller → service → repository`. Global routes hanya mengimpor controller; controller mengimpor service; hanya service mengimpor repository. Repository tidak mengimpor service/controller dan controller tidak mengimpor repository/database. Type dan kontrak bersama boleh diimpor terpisah. Middleware juga mengakses database melalui service. Test repository boleh mengimpor repository sebagai subjek pengujian.

- Kumpulkan semua controller API dalam satu fungsi `routes()` di `apps/server/src/routes.ts`. `app.ts` hanya memasang hasilnya pada prefix `/api` dan mengekspor tipe RPC.
