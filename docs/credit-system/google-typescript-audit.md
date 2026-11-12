# Audit Google TypeScript Style Guide

Tanggal: 12 November 2026. Acuan: [Google TS/JS Style Guide](https://google.github.io/styleguide/tsguide.html). Status: profil yang disesuaikan untuk proyek Bun/Hono/React; bukan klaim kepatuhan Google penuh. Perubahan mencakup source aplikasi, package, test, tooling dan konfigurasi Biome/editor.

## Aturan yang diadopsi

Profil proyek memakai single quote untuk string TS/JS, semicolon eksplisit, dua spasi, blok kontrol dengan braces, import di awal modul, named export, serta interface untuk object alias yang dapat dimodelkan sebagai interface. Union, conditional type, dan inferensi Zod tetap menggunakan type alias. Array sederhana memakai T[]; elemen kompleks memakai Array<T>. Type-only import memakai import type. Return type boleh diinferensikan.

## Perbaikan pada repository

| Temuan lokal | Perubahan |
| --- | --- |
| Format source memakai kutip ganda | Biome JavaScript quoteStyle single; formatter menetapkan indentWidth 2, semicolons always dan lineWidth 80. JSX tetap memakai format JSX Biome. |
| Banyak if/for satu statement tanpa braces | useBlockStatements error dan perapian seluruh source/test. Aturan lokal ini lebih ketat dari pengecualian if satu baris pada panduan. |
| Object type alias bernama | useConsistentTypeDefinitions interface; AuthEnv dipindahkan ke constant/interface.ts dan semua import diperbarui. Type alias infer/union/generic tetap dipertahankan. |
| Import terpisah deklarasi pada auth.service dan type fitur | Import dikumpulkan di awal modul, satu blank line sebelum implementasi. Dynamic import dalam anotasi AuthEnv diganti import type. |
| Handler controller bernama memakai const async arrow | Handler top-level yang relevan memakai function declaration. Object handler/service/repository tetap mengikuti komposisi layer proyek. |
| Array dengan object/generic kompleks memakai shorthand | Bentuk kompleks diperjelas menjadi Array<T>; shorthand array sederhana dipertahankan. Tidak memakai aturan Biome array global karena opsinya belum mewakili kombinasi ini. |
| Assertion slug setelah filter | Diganti flatMap dengan narrowing; tidak lagi memerlukan as string. |
| Utilitas bersama kurang menjelaskan batas penggunaan | JSDoc ditambahkan pada transaksi, ekspor file, pembentuk route CRUD dan pemetaan CRUDA. |
| Editor memilih formatter lama | Default formatter dan actions on save diselaraskan ke Biome. |

Biome menolak default export pada source biasa, CommonJS, var, namespace, explicit any, non-null assertion dan unsafe declaration merging. Aturan import/export type serta banned wrapper types dari audit sebelumnya tetap aktif. tsconfig strict dari audit sebelumnya dipertahankan; panduan Google tidak menetapkan preset tsconfig khusus yang harus menggantikan konfigurasi Bun/Vite.

## Penyesuaian yang disengaja

- Alias @server/@web dan workspace @credit dipertahankan sesuai instruksi pengguna, walaupun panduan menyarankan relative imports dalam logical project.
- Default export dibolehkan hanya pada file *.config.ts dan entry Bun apps/server/src/index.ts. Import default dependency eksternal tetap dibolehkan bila API dependency memerlukannya.
- Nama file feature.layer.ts, FeaturePage.tsx dan folder constant mengikuti standar pengguna. React component function tetap UpperCamelCase.
- Schema runtime Zod tetap .ts, bukan .d.ts. Modul deklarasi TanStack Router tetap merupakan module augmentation, bukan global namespace.
- Tidak memasang toolchain internal Google/tsetse/tsec; Biome dan tsc tetap alat verifikasi proyek.

## Temuan yang masih terbuka

- Dua belas as never pada input Hono RPC masih merupakan celah tipe yang tercatat pada audit TypeScript sebelumnya; perlu validator input bertipe, bukan sekadar formatting.
- Cast komposisi schema Hono tetap diperlukan oleh konvensi pendaftaran route terpisah saat ini; cast output jsPDF mengikuti batas tipe dependency. Ini belum merupakan pembuktian kesetaraan seluruh tipe runtime.
- JSDoc belum mencakup seluruh ekspor fitur. Dokumentasi utilitas bersama sudah diperbaiki; ekspor publik yang lebih luas perlu dokumentasi bermakna, bukan komentar yang hanya mengulang nama.
- Beberapa factory lokal masih memakai arrow function; belum semua named top-level function mengikuti preferensi deklarasi panduan.
- Keterbatasan ambient Bun frontend dan skipLibCheck dependency tetap seperti dalam typescript-audit.md. Audit gaya tidak menyelesaikan keduanya.

## Hasil aktual

Lint, typecheck workspace/tooling/test dan build lulus. Regresi MySQL disposable credit_style_test: 10 unit, 6 integration dan 12 E2E lulus setelah migration/seed sintetis. Warning dependency Zod dan ukuran chunk frontend tetap ada. Tidak ada perubahan endpoint, permission atau keputusan bisnis; tidak ada script test sementara yang disimpan.
