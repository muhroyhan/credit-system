# Backend credit-system

- Terapkan tiga layer backend: `controller` (handler request/response dan validasi), `service` (use case dan aturan bisnis), `repository` (Drizzle dan adapter). Simpan langsung di folder fitur sebagai `<feature>.controller.ts`, `<feature>.service.ts`, dan `<feature>.repository.ts`; simbol utama mengikuti `<featureCamelCase>Controller`, `<featureCamelCase>Service`, dan `<featureCamelCase>Repository`. Jangan buat subfolder layer.
- Simpan deklarasi type dan interface setiap fitur dalam `<feature>.type.ts` di folder fitur yang sama; gunakan `import type` untuk konsumen tipe. Kontrak Zod bersama tetap di `packages/contracts`.
- Validasi body, query dan parameter dengan Zod; gunakan kontrak bersama di `packages/contracts`.
- Export tipe Hono RPC tanpa mengekspos koneksi database atau konfigurasi server ke bundle frontend.
- Pertahankan status HRD/BPR, rumus dan urutan business flow di `docs/credit-system/business-flow.md`; catat perubahan perilaku dan logic hole di `docs/credit-system/logic-holes.md`.
- Gunakan MySQL/Drizzle; hindari menganggap relasi sebagai constraint tanpa verifikasi DDL. Gunakan adapter untuk storage, WhatsApp dan PDF.
- Uji service dengan Vitest unit serta route dan repository dengan Vitest integration pada database disposable; lihat `docs/credit-system/testing.md`.
- Daftarkan route Hono melalui `const app = new Hono()` dan pemanggilan `app.get`, `app.use` atau `app.route` terpisah; pertahankan inferensi `AppType` RPC untuk seluruh route.
- Pasang prefix `/api` satu kali. Daftarkan middleware dan handler endpoint dalam pemanggilan yang sama, misalnya `app.get("/programs", identityContext, handler)`, agar path tidak diulang pada `app.use` dan `app.get`.

- Ikuti `docs/credit-system/api-code-standards.md` untuk pola repository, service, global routes, validasi, error, dan tipe RPC. Ambil `const db = connectDatabase().db` sekali di setiap fungsi repository dan gunakan `db` untuk query.

- Urutan akses dan import wajib `global routes → feature routes → controller → service → repository`. Global routes mengimpor feature routes, feature routes mengimpor controller dan middleware; controller mengimpor service; hanya service mengimpor repository. Repository tidak mengimpor service/controller dan controller tidak mengimpor repository/database. Type dan kontrak bersama boleh diimpor terpisah. Middleware juga mengakses database melalui service. Test repository boleh mengimpor repository sebagai subjek pengujian.

- Daftarkan method dan path HTTP di `<feature>.routes.ts`; `apps/server/src/routes.ts` menggabungkan route fitur. Controller mengekspor handler/middleware tanpa mendaftarkan route; `app.ts` hanya memasang hasilnya pada prefix `/api` dan mengekspor tipe RPC.

- Semua middleware backend berada di `apps/server/src/middleware/`, satu fungsi middleware per file bernama `<nama>.middleware.ts`. Feature routes mengimpor middleware langsung; middleware yang membutuhkan aturan bisnis hanya mengakses service, bukan repository. Middleware bawaan dibungkus di folder yang sama.

- Setiap service yang menangani API non-GET menjalankan seluruh operasi database dalam satu transaksi Drizzle melalui `withTransaction`; teruskan transaction ke repository dan gunakan transaction tersebut untuk setiap query. Kegagalan harus dilempar agar rollback; jangan membuka atau menutup pool per request.

- Hanya service yang melempar error bisnis. Repository mengembalikan hasil query (data/null/boolean/ID) dan tidak membuat error bisnis atau membuka transaksi. Error teknis Drizzle/driver diteruskan secara alami. Satu service boleh menggunakan banyak repository; seluruh query penulisan memakai transaksi service yang sama.

- Kelompokkan route fitur dengan satu `app.route` per prefix fitur; method dan path didaftarkan di `<feature>.routes.ts`. Gunakan `permission("PROGRAM_CREATE|READ|UPDATE|DELETE|APPROVAL")` untuk otorisasi aksi, dengan string sebenarnya seperti `USA_CREATE`. Hanya aksi granular yang diterima; Approval harus eksplisit.

- Definisi yang dipakai lintas fitur dalam aplikasi berada di `src/constant/constant.ts`, `type.ts`, `interface.ts`, dan `schema.ts` sesuai jenisnya. Definisi khusus fitur tetap di file fitur; kontrak lintas package tetap di `@credit/contracts`.
