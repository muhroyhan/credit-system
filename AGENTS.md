# credit-system — instruksi agent

Instruksi utama proyek; instruksi direktori melengkapi file ini. Dokumen menyimpan kebutuhan, kontrak, rencana dan bukti, bukan menggantikan instruksi kerja.

## Tujuan dan batasan

- Jangan mengubah aturan bisnis tanpa instruksi pengguna. Catat risiko dan dampak kompatibilitas di [logic-holes.md](docs/credit-system/logic-holes.md); bedakan kebutuhan, implementasi dan hasil verifikasi.
- Rahasia dan data produksi tidak digunakan untuk pengembangan/test. Docker hanya untuk MySQL lokal; aplikasi, tooling dan test berjalan native.

## Stack dan struktur

Satu deployment Bun/Hono melayani API serta aset React/Vite. Database MySQL melalui Drizzle; UI Mantine; validasi Zod; pnpm workspace, Turbo, Biome dan TypeScript strict. Tooling dan lingkungan ada di [local-development.md](docs/credit-system/local-development.md).

| Lokasi                             | Isi                                                                                                                                                                                |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| apps/server/src/features/feature   | feature.routes.ts, feature.controller.ts, feature.service.ts, feature.repository.ts, feature.type.ts; feature.error.ts bila diperlukan                                             |
| apps/server/src/middleware         | Satu fungsi middleware per file nama.middleware.ts                                                                                                                                 |
| apps/web/src/features/feature      | FeaturePage.tsx, FeatureAddPage.tsx, FeatureEditPage.tsx, FeatureViewPage.tsx, feature.routes.ts, feature.api.ts, feature.type.ts; hooks/ dan components/ atau utils/ khusus fitur |
| apps/web/src/components, src/utils | Komponen dan utilitas frontend lintas fitur                                                                                                                                        |
| apps/*/src/constant                | constant.ts, type.ts, interface.ts, schema.ts untuk definisi lintas fitur sesuai jenisnya                                                                                          |
| packages/contracts                 | Schema Zod dan DTO lintas package                                                                                                                                                  |
| packages/database                  | Schema fisik, koneksi, migration dan seed                                                                                                                                          |
| packages/test-utils                | Adapter dan fixture sintetis                                                                                                                                                       |

Import lintas package melalui @credit/... dan ekspor publik; dalam aplikasi melalui @server/* atau @web/*. Selaraskan tsconfig, runtime dan test resolver. Simbol utama backend memakai featureCamelCaseLayer. Tipe dan schema khusus fitur berada di feature.type.ts; konstanta khusus fitur berada di feature.constant.ts. Schema runtime memakai .ts, deklarasi tanpa implementasi dapat memakai .d.ts. Gunakan import/export type untuk dependency tipe.

## TypeScript, Biome dan gaya

Profil proyek mengadaptasi [TypeScript Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html) dan [Google TS/JS Style Guide](https://google.github.io/styleguide/tsguide.html), bukan sertifikasi kepatuhan Google penuh.

- Biome menjadi sumber format: dua spasi, single quote TS/JS, semicolon eksplisit, lebar target 80; semua blok kontrol memakai braces. Object alias yang dapat dimodelkan sebagai interface menggunakan interface; union/conditional/infer Zod tetap type. Array sederhana T[], elemen kompleks Array<T> (review manual).
- Import berada di awal modul, named export menjadi default. Pengecualian default export hanya *.config.ts dan entry Bun index.ts; default import dependency eksternal boleh sesuai API-nya. Factory/handler bernama mengutamakan function declaration; callback boleh arrow.
- Biome menolak var, CommonJS, namespace, explicit any, wrapper type terlarang, non-null assertion dan unsafe declaration merging. Jangan menambah blanket suppression, ambient stub palsu atau menonaktifkan strict untuk melewati error.
- tsconfig mempertahankan strict, isolatedModules, verbatimModuleSyntax, noUncheckedIndexedAccess, unused/casing/override/fallthrough checks. pnpm typecheck mencakup lima workspace, tooling dan test. lib/types ditentukan per lingkungan; konfigurasi adalah sumber nilai flag persisnya.
- Return type boleh diinferensikan, khususnya komposisi Hono/TanStack. Dokumentasikan ekspor/utilitas publik dengan JSDoc yang menjelaskan batas penggunaan, bukan mengulang nama.
- Package masih private dan mengekspor source .ts untuk Bun/Vite. Distribusi publik memerlukan desain artefak JS/declaration yang cocok. Alias/import serta nama file mengikuti standar proyek, bukan menyalin seluruh konvensi lingkungan internal Google.

## Pelaksanaan phase

1. Kerjakan fitur setelah dependensinya selesai; jangan menjadikan fitur phase mendatang prasyarat tersembunyi. Seed boleh memenuhi prasyarat data.
2. Pertahankan kode Pxx-Tyy. Setiap task menghasilkan satu commit terfokus; daftarkan subtask berkode bila perlu dipecah. Catat status todo/doing/blocked/done, commit dan keputusan.
3. Commit hanya di custom branch. Periksa branch sebelum mulai dan sebelum commit. Jika main/detached atau belum ada branch custom, ingatkan pengguna dan tunda commit.
4. Format commit mengikuti [Git Commit Best Practices](https://gist.github.com/Aditi3/a7a1ddd1ecef73dab548f7955210cfff): `<type>(scope opsional): <subject>` imperative huruf kecil, tanpa titik, subject maksimum 50 karakter; body dibungkus 72 karakter. Footer `Task: Pxx-Tyy` menjaga trace.
5. Jalankan test pada task terakhir setiap phase, bukan tiap task. Task sebelumnya boleh menyiapkan test permanen. Pada verifikasi akhir jalankan lint/typecheck/build serta suite relevan sesuai [testing.md](docs/credit-system/testing.md); laporan harus menyebut hasil aktual.
6. Phase selesai setelah semua task, kontrak/model/keputusan terkait dan verifikasi terakhir selesai. Jika schema berubah sertakan migration; bila data diperlukan perbarui seed. Runner/perintah hanya di runbook lokal.
7. Hapus script test sementara sebelum commit verifikasi; test permanen, fixture, seed.ts dan migrate.ts tetap disimpan. Keputusan bisnis yang belum tersedia hanya memblokir pekerjaan yang bergantung padanya.

## Referensi dan instruksi direktori

- [Server](apps/server/AGENTS.md), [web](apps/web/AGENTS.md), [database](packages/database/AGENTS.md), [E2E](tests/e2e/AGENTS.md).
- [Alur bisnis](docs/credit-system/business-flow.md), [kontrak API](docs/credit-system/api-contract.md), [model data](docs/credit-system/data-model.md), [rencana](docs/credit-system/development-plan.md), [acceptance dan hasil](docs/credit-system/testing.md), [pengembangan lokal](docs/credit-system/local-development.md).

Nilai pilihan domain yang dipakai berulang ditetapkan sebagai objek enum `as const` beserta tipe union bernama sama, satu definisi per file `kebab-case.enum.ts` (contoh `ExportTypeEnum` di `export-type.enum.ts`). Enum yang hanya dipakai satu fitur berada di folder enums fitur tersebut; enum lintas fitur dalam satu aplikasi berada di src/enums aplikasi itu. Enum lintas aplikasi atau yang diperlukan schema/DTO bersama berada di packages/contracts dan diimpor melalui ekspor publik; schema Zod, perbandingan nilai dan UI memakai sumber yang sama. Nama kolom/path serta teks bebas bukan enum.
