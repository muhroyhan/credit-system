# Audit standar TypeScript dan Biome

Tanggal: 12 November 2026. Versi yang diverifikasi: TypeScript 5.9.3 dan Biome 2.6.7. Cakupan: source aplikasi/package, manifest workspace, seluruh tsconfig, test/tooling, module augmentation dan ekspor publik. Ini audit kode aplikasi privat yang dijalankan Bun/Vite, bukan sertifikasi declaration dependency pihak ketiga.

## Acuan dan batas penerapan

[Declaration Files Introduction](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html) membahas penulisan deklarasi untuk menjelaskan API JavaScript. [Do’s and Don’ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html) dipakai untuk memeriksa tipe primitif, generic yang bermakna, pemakaian unknown, callback dan overload. File `.type.ts`/`schema.ts` tetap modul TypeScript; schema Zod memiliki implementasi runtime sehingga tidak dipindahkan ke `.d.ts`.

[Choosing Compiler Options](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html) menjadi acuan mode module dan lingkungan. Bun/Vite memakai ESNext/Bundler dengan noEmit; ini bukan konfigurasi distribusi library untuk konsumen Node tanpa bundler. Semua package saat ini private dan mengekspor source `.ts`, sehingga belum membutuhkan pipeline publish declaration. Jika package dipublikasikan, ekspor JS dan declaration harus diselaraskan dengan artefak build.

## Temuan dan perbaikan

| Area | Hasil audit |
| --- | --- |
| Tipe dasar | Tidak ditemukan explicit any, wrapper primitive sebagai anotasi, `@ts-ignore` atau `@ts-nocheck` pada source yang diperiksa. Pemanggilan runtime `Number(...)`/`String(...)` bukan wrapper object type. |
| Generic/callback | Generic RPC memakai parameter tipenya; tidak ditemukan pola overload redundan yang dibahas panduan. `SchemaOf` mempertahankan inferensi tipe Hono. |
| Declaration/module | Tidak ada `.d.ts` buatan proyek. Augmentation TanStack Router berada dalam modul yang mengimpor router, tidak membuat global ambient palsu. |
| Compiler | Strict dan verbatimModuleSyntax dipertahankan; isolatedModules, moduleDetection force, casing, noImplicitOverride, noFallthroughCasesInSwitch, noUnusedLocals/Parameters, noUncheckedIndexedAccess dan esModuleInterop dibuat eksplisit. |
| Lingkungan | lib/types dinyatakan per config: kontrak ES2022 tanpa ambient runtime; server/database Bun; test-utils dan root tooling Node; frontend DOM/Vite dengan Bun sementara untuk dependency tipe RPC. |
| Cakupan typecheck | Ditambahkan tsconfig test dan test-utils. `pnpm typecheck` memeriksa lima workspace melalui Turbo, lalu config tooling root dan seluruh test; Vite/drizzle config turut dicakup oleh config pemilik. |
| Fixture | Pemeriksaan array ketat menemukan spread item yang mungkin undefined pada integration perusahaan; fixture diperjelas tanpa non-null assertion. |
| Biome | Preset recommended dan larangan explicit any, banned wrapper types, namespace, unsafe declaration merging, non-null assertion serta aturan import/export type dibuat eksplisit. Tidak ada blanket suppression atau penghapusan strict untuk membuat audit lulus. |

[Dokumentasi Biome useImportType](https://biomejs.dev/linter/rules/use-import-type/) menjadi acuan pemisahan dependency runtime dan tipe; pemeriksaan assignability tetap dilakukan tsc.

## Batas yang masih terbuka

1. Dua belas assertion `as never` masih ada di gateway Admin User/Perusahaan karena controller Hono memvalidasi body/query secara manual dan belum mengekspos input RPC tervalidasi. Ini bukan error declaration syntax, tetapi batas pemeriksaan request end-to-end. Jangan mengklaim request sudah sepenuhnya type safe. Perbaikannya memerlukan validator bertipe dan regresi kontrak endpoint.
2. Frontend masih memuat ambient Bun karena `@credit/server/app` mengekspor tipe yang menelusuri source backend. Tidak ada import runtime backend di gateway, tetapi isolasi lingkungan tipe belum sempurna. Deklarasi RPC mandiri perlu dirancang jika ingin melepas ketergantungan ambient ini.
3. `skipLibCheck: true` dipertahankan secara eksplisit. Probe `tsc -p apps/server/tsconfig.json --skipLibCheck false` gagal pada deklarasi Bun/Node, optional driver Drizzle serta referensi DOM Hono/jsPDF. Tidak menambahkan declaration stub palsu untuk menutupi kegagalan. Kode proyek tetap diperiksa; kompatibilitas seluruh `.d.ts` dependency belum lulus.
4. `exactOptionalPropertyTypes` belum diaktifkan. Panduan declaration tidak mewajibkannya; perubahan semantik optional input/DTO perlu audit tersendiri. Biome juga bukan pengganti pemeriksaan perilaku bisnis atau otorisasi.

## Verifikasi aktual

- `pnpm lint`: lulus dengan aturan eksplisit.
- `pnpm typecheck`: lulus untuk workspace, tooling dan test.
- `pnpm build`: lulus; warning dependency Zod dan ukuran chunk frontend tetap muncul.
- `pnpm test:unit`: 10 test lulus.
- Probe declaration dependency tanpa skipLibCheck: gagal seperti temuan di atas.
- Integration/E2E tidak dijalankan dalam audit ini; konfigurasi dan fixture berubah, tanpa perubahan logika bisnis aplikasi.
