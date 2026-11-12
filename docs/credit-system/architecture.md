# Arsitektur dan standar kode

Sumber tunggal standar implementasi. Aturan bisnis, transport API, data, eksekusi lokal dan verifikasi masing-masing berada di dokumen yang ditautkan dari AGENTS.md; jangan menyalin aturannya ke sini.

## Stack dan struktur

Satu deployment Bun/Hono melayani API serta aset React/Vite. Database MySQL melalui Drizzle; UI Mantine; validasi Zod; pnpm workspace, Turbo, Biome dan TypeScript strict. Tooling dan lingkungan ada di [local-development.md](local-development.md).

| Lokasi | Isi |
| --- | --- |
| apps/server/src/features/feature | feature.routes.ts, feature.controller.ts, feature.service.ts, feature.repository.ts, feature.type.ts; feature.error.ts bila diperlukan |
| apps/server/src/middleware | Satu fungsi middleware per file nama.middleware.ts |
| apps/web/src/features/feature | FeaturePage.tsx, FeatureAddPage.tsx, FeatureEditPage.tsx, FeatureViewPage.tsx, feature.routes.ts, feature.api.ts, feature.type.ts; hooks/ dan components/ atau utils/ khusus fitur |
| apps/web/src/components, src/utils | Komponen dan utilitas frontend lintas fitur |
| apps/*/src/constant | constant.ts, type.ts, interface.ts, schema.ts untuk definisi lintas fitur sesuai jenisnya |
| packages/contracts | Schema Zod dan DTO lintas package |
| packages/database | Schema fisik, koneksi, migration dan seed |
| packages/test-utils | Adapter dan fixture sintetis |

Import lintas package melalui @credit/... dan ekspor publik; dalam aplikasi melalui @server/* atau @web/*. Selaraskan tsconfig, runtime dan test resolver. Simbol utama backend memakai featureCamelCaseLayer. Definisi khusus fitur tetap di feature.type.ts; schema runtime memakai .ts, deklarasi tanpa implementasi dapat memakai .d.ts. Gunakan import/export type untuk dependency tipe.

## Backend

Urutan akses sekaligus import: global routes → feature routes → controller → service → repository. Global routes menggabungkan feature.routes.ts; route fitur mengimpor controller dan middleware; controller mengimpor service; hanya service yang mengimpor repository. Type/kontrak bersama merupakan dependency tersendiri. Test boleh mengimpor unit yang sedang diuji.

- app.ts hanya memasang /api sekali dan mengekspor AppType. Definisikan method/path pada feature.routes.ts, controller hanya handler. Gunakan const app = new Hono() dan pemanggilan method terpisah, bukan chaining panjang; pasang satu prefix fitur dan tulis path endpoint sekali bersama middleware/handler.
- Urutan request: autentikasi, izin/scope yang diperlukan, validasi Zod, service, respons. Route publik tetap publik. JSON malformed menjadi input invalid; kegagalan internal tidak disamarkan sebagai validasi.
- Controller menerima request dan mengirim respons. Gunakan input untuk body tervalidasi, query untuk filter dan result untuk hasil service. Detail bentuk respons/status hanya di [api-contract.md](api-contract.md).
- Service berisi aturan bisnis dan satu-satunya tempat throw error bisnis. Satu service boleh memakai banyak repository. Service non-GET membuka satu withTransaction dan meneruskan transaksi yang sama ke seluruh operasi DB; error harus keluar dari callback agar rollback. Pekerjaan non-DB dapat dilakukan sebelum transaksi.
- Repository hanya query dan mapping data dengan interface bertipe di feature.type.ts. Terima transaksi service untuk penulisan; jangan membuka transaksi sendiri atau membuat error bisnis. Error teknis driver diteruskan. Kembalikan DTO konkret/null/boolean/ID, bukan unknown; pilih kolom publik secara eksplisit dan jangan sertakan hash password.
- Untuk pembacaan tanpa transaksi ambil const db = connectDatabase().db sekali per fungsi. Jangan menutup pool per repository; tutup hanya saat aplikasi/runner mandiri berakhir. Audit dan updatedAt berasal server.
- Middleware hanya dibuat ketika dipakai, diimpor route fitur dan mengakses aturan bisnis melalui service. Bungkus middleware bawaan di folder middleware yang sama. ACL berupa PROGRAM_ACTION melalui permission(...); daftar aksi dan mapping program hanya di kontrak API.
- Pertahankan tipe Hono RPC saat route digabung. Tipe AppType boleh diimpor frontend dengan import type; jangan memasukkan kode server atau kredensial ke bundle browser.
- Ekspor PDF/XLSX dibentuk di server memakai utils/export-file.ts. Service menyiapkan kolom/data, memakai repository listing yang sama tanpa pagination atau batas jumlah data, menerapkan filter/sort/scope. Frontend hanya mengunduh hasil.

## Frontend

Komponen memakai hook/use case; RPC dan mapping DTO berada di feature.api.ts. Hook dalam feature/hooks. Dashboard terpisah dari auth.

Root router.tsx mendefinisikan /, /login dan prefix fitur. Child route di feature.routes.ts melalui createCrudRoutes. Empat halaman standar:

| Page | Tugas |
| --- | --- |
| FeaturePage | Listing dengan filter/sort/pagination, aksi baris, tambah dan ekspor |
| FeatureAddPage | Form tambah |
| FeatureEditPage | Form edit, boleh berbagi komponen form dengan tambah |
| FeatureViewPage | Detail berupa teks; bukan input disabled |

Pakai komponen bersama src/components/crud: CrudPage (layout/ACL), ListingTable (tabel/pagination/export), RecordState (ID/loading/error), DetailFields, DeleteAction dan FormActions. Fitur menyediakan kolom, filter, mapping, field dan hook; jangan menyalin layout/kontrol yang sama.

TanStack Router mengelola routing; TanStack Query mengelola data API. Query key mencakup sesi/parameter, mutation menginvalidasi query terkait, cache dibersihkan saat logout. React Hook Form memakai Zod resolver, menampilkan error per field, dan tidak meneruskan data invalid ke mutation. UI menampilkan loading/kosong/sukses/gagal sesuai hasil operasi.

Gate CRUDA melindungi halaman dan aksi sebelum konten/query dimount, termasuk akses URL langsung. Hak UI memakai snapshot login; otorisasi API tetap wajib. Kontrak sesi/izin hanya di api-contract.md.

## TypeScript, Biome dan gaya

Profil proyek mengadaptasi [TypeScript Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html) dan [Google TS/JS Style Guide](https://google.github.io/styleguide/tsguide.html), bukan sertifikasi kepatuhan Google penuh.

- Biome menjadi sumber format: dua spasi, single quote TS/JS, semicolon eksplisit, lebar target 80; semua blok kontrol memakai braces. Object alias yang dapat dimodelkan sebagai interface menggunakan interface; union/conditional/infer Zod tetap type. Array sederhana T[], elemen kompleks Array<T> (review manual).
- Import berada di awal modul, named export menjadi default. Pengecualian default export hanya *.config.ts dan entry Bun index.ts; default import dependency eksternal boleh sesuai API-nya. Factory/handler bernama mengutamakan function declaration; callback boleh arrow.
- Biome menolak var, CommonJS, namespace, explicit any, wrapper type terlarang, non-null assertion dan unsafe declaration merging. Jangan menambah blanket suppression, ambient stub palsu atau menonaktifkan strict untuk melewati error.
- tsconfig mempertahankan strict, isolatedModules, verbatimModuleSyntax, noUncheckedIndexedAccess, unused/casing/override/fallthrough checks. pnpm typecheck mencakup lima workspace, tooling dan test. lib/types ditentukan per lingkungan; konfigurasi adalah sumber nilai flag persisnya.
- Return type boleh diinferensikan, khususnya komposisi Hono/TanStack. Dokumentasikan ekspor/utilitas publik dengan JSDoc yang menjelaskan batas penggunaan, bukan mengulang nama.
- Package masih private dan mengekspor source .ts untuk Bun/Vite. Distribusi publik memerlukan desain artefak JS/declaration yang cocok. Alias/import serta nama file mengikuti standar proyek, bukan menyalin seluruh konvensi lingkungan internal Google.

Temuan audit yang belum selesai hanya dicatat pada [logic-holes.md](logic-holes.md), hasil pemeriksaan hanya pada [testing.md](testing.md).
