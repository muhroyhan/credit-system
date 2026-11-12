# Arsitektur credit-system

## Target

- Aplikasi monolitik: satu deployment dan proses Bun/Hono, satu database MySQL, frontend React statis disajikan oleh server yang sama. Vite development server dapat memakai proxy `/api`.
- pnpm workspace dan Turborepo untuk organisasi package; pnpm mengelola dependency dan satu `pnpm-lock.yaml`. Bun adalah runtime aplikasi.
- Frontend: React, Vite, Mantine dan Zod. Backend: Hono RPC, Zod dan Drizzle ORM. TypeScript strict di kedua sisi.
- Biome untuk format dan lint. Vitest untuk unit/integration frontend dan backend; Playwright untuk E2E fullstack.

## Tiga layer per fitur

| Frontend | Backend | Tanggung jawab |
| --- | --- | --- |
| `presentation` | `controller` | Komponen/form di frontend; handler request/response dan validasi di backend; method/path didaftarkan di `routes.ts` dan middleware berada di `src/middleware`. |
| `application` | `service` | Hook/state di frontend; use case, aturan bisnis dan interface repository di backend. |
| `data` | `repository` | RPC gateway di frontend; query Drizzle dan adapter di backend. |

Di backend, file langsung berada dalam folder fitur dengan nama `<feature>.<layer>.ts`, dengan layer `controller`, `service`, dan `repository`. Simbol utama menggunakan `<featureCamelCase><Layer>`. Frontend menyimpan hook di `<feature>/hooks` dan file lainnya langsung di folder fitur: halaman yang diimpor router bernama `FeaturePage.tsx` dan akses API bernama `feature.api.ts`, dan deklarasi type/interface disimpan dalam satu `feature.type.ts` per fitur. Subfolder digunakan untuk komponen atau utilitas khusus fitur; komponen dan utilitas bersama berada di `src/components` dan `src/utils`. Alur backend wajib global routes â†’ controller â†’ service â†’ repository. Global routes mengimpor controller serta middleware; controller mengimpor service; hanya service mengimpor repository. Controller menerima request dan mengirim response, service menjalankan aturan bisnis, dan repository menjalankan query. Repository tidak mengimpor layer di atasnya; frontend dari presentation ke application ke data. Infrastruktur bersama dan kontrak merupakan fondasi komposisi, bukan layer bisnis keempat. Antarfitur menggunakan interface publik, bukan impor internal feature lain.

## Struktur target

```text
credit-system/
  AGENTS.md
  pnpm-workspace.yaml
  turbo.json
  biome.json
  apps/
    server/src/features/<feature>/
      <feature>.controller.ts
      <feature>.service.ts
      <feature>.repository.ts
      <feature>.type.ts
    server/src/middleware/  # satu fungsi middleware per file
    server/src/infrastructure/
    web/src/features/<feature>/  # halaman, hook, dan <feature>.api.ts
    web/src/components/  # komponen bersama
    web/src/utils/       # utilitas bersama
    web/src/app/
  packages/
    contracts/       # Zod schemas dan DTO bersama
    database/        # Drizzle schema, koneksi, migration
    config/          # Konfigurasi TypeScript bersama
    test-utils/      # Fixture sintetis dan adapter test
  tests/e2e/
  docs/credit-system/
```

Feature: auth, admin users, companies, debtors, credits, credit review, confirmation, documents, dashboard dan reference data. Penamaan package dapat disesuaikan selama batas layer dan satu deployment dipertahankan. Struktur ini adalah rancangan; keberadaan folder, scripts dan dependency harus diperiksa ketika implementasi dimulai.

## Kontrak dan data

- Export `AppType` dari route Hono yang dirangkai; frontend menggunakan `hc<AppType>` dengan type-only import. Jangan membawa server entry point, konfigurasi rahasia, atau driver database ke bundle browser.
- Definisikan schema request/response Zod di package contracts, dan terapkan validasi runtime di frontend dan backend. Kontrak tidak mengimpor aplikasi atau database.
- Jaga konversi persistence `snake_case` ke DTO `camelCase`, input numerik/nominal, tanggal, upload dan status. Perubahan format atau pembatasan input yang memengaruhi flow harus dicatat.
- Model data dan relasi dijelaskan di [data-model.md](data-model.md). Jangan menganggap relasi Drizzle sebagai bukti adanya constraint database. Verifikasi DDL, index, nullability, unique, FK, seed, presisi dan data sebelum menyiapkan migration untuk data yang sudah ada.
- Tipe nominal campuran memerlukan keputusan presisi dan pembulatan; jangan mengganti formula bisnis secara diam-diam. Tetap dukung verifikasi hash bcrypt yang digunakan akun.
- Storage, WhatsApp dan PDF berada di adapter infrastruktur. Hindari menjadikan kegagalan adapter sebagai alasan perubahan urutan business flow tanpa keputusan yang didokumentasikan.

## Build dan konfigurasi

Target script root: `dev`, `build`, `typecheck`, `lint`, `format`, `test:unit`, `test:integration`, `test:e2e`, `db:generate`, `db:migrate`, `start`. Script ini baru dapat dijalankan setelah dibuat dan diverifikasi pada implementasi. Turbo tidak boleh menjalankan migration sebagai efek samping build; test yang bergantung state database dan migration tidak di-cache.

## Lingkungan lokal

Docker hanya digunakan untuk menjalankan service database MySQL lokal. Jalankan server Bun/Hono, Vite saat development, serta perintah build, migration dan test secara native di host; jangan memasukkan aplikasi atau tooling ke container. Server mengakses MySQL melalui alamat dan port host yang dikonfigurasi di environment. Untuk integration dan E2E, gunakan database test terisolasi dan disposable yang terpisah dari database development.

Konfigurasi Docker, port, kredensial lokal, dan perintah menjalankan service masih perlu dibuat dan diverifikasi saat implementasi; dokumen ini tidak menyatakan bahwa file Compose atau script tersebut sudah tersedia. Migration dijalankan secara eksplisit setelah database siap, bukan otomatis saat build.

## Aset dan environment

Build web menghasilkan aset yang disajikan server Bun/Hono. Fallback SPA berlaku untuk route frontend, bukan untuk kesalahan `/api` atau aset yang hilang. Tool development dapat membutuhkan Node yang kompatibel, meski server berjalan pada Bun; Vitest tetap dipakai untuk test yang diminta.

Gunakan `.env.example` berisi placeholder untuk database, JWT, storage, WhatsApp, URL aplikasi dan PDF. Jangan menaruh kredensial dalam repository. Pemilihan versi dependency dan detail deploy ditetapkan dan diuji saat implementasi.

## Halaman frontend dan CRUDA

Setiap fitur CRUD memisahkan listing (`FeaturePage.tsx`), tambah (`FeatureAddPage.tsx`), edit (`FeatureEditPage.tsx`) dan detail teks (`FeatureViewPage.tsx`). Listing menyediakan filter, sorting, pagination, row actions dan ekspor PDF/XLSX. Hook berada dalam `<feature>/hooks`; komponen form khusus fitur berada dalam `<feature>/components`. Dashboard berada dalam fitur `dashboard`, terpisah dari `auth`.

Gate halaman dan action mengikuti CRUDA: Create, Read, Update, Delete, Approval. Pemetaan Admin User sesuai API: USA_READ atau USA_WRITE untuk Read dan ekspor, USA_WRITE untuk Create/Update/Delete. Approval belum memiliki endpoint/permission pada fitur ini dan selalu ditolak. Pemetaan fitur lain harus mengikuti endpoint server masing-masing; WRITE tidak otomatis memberi Approval. Frontend memakai snapshot role dari login; API tetap memverifikasi izin terkini setiap request.

Ekspor PDF/XLSX dibuat oleh utilitas bersama `apps/server/src/utils/export-file.ts`; service fitur menyiapkan data dan kolom. Ekspor Admin User dibuat oleh server melalui endpoint yang menerapkan filter dan sorting tanpa pagination. Endpoint memerlukan USA_READ atau USA_WRITE dan menghasilkan PDF/XLSX tanpa password atau role.
