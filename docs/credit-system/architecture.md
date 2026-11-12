# Arsitektur credit-system

## Target

- Aplikasi monolitik: satu deployment dan proses Bun/Hono, satu database MySQL, frontend React statis disajikan oleh server yang sama. Vite development server dapat memakai proxy `/api`.
- pnpm workspace dan Turborepo untuk organisasi package; pnpm mengelola dependency dan satu `pnpm-lock.yaml`. Bun adalah runtime aplikasi.
- Frontend: React, Vite, Mantine dan Zod. Backend: Hono RPC, Zod dan Drizzle ORM. TypeScript strict di kedua sisi.
- Biome untuk format dan lint. Vitest untuk unit/integration frontend dan backend; Playwright untuk E2E fullstack.

## Tiga layer per fitur

| Layer | Frontend | Backend |
| --- | --- | --- |
| `presentation` | Halaman dan komponen Mantine, form dan navigasi; tidak memanggil RPC langsung. | Route Hono, validasi Zod, identity context, pemetaan response/error; tidak berisi query ORM. |
| `application` | Hook/view model, state, use case UI, perhitungan dan aturan tampilan. | Use case, aturan bisnis, perhitungan murni, orchestration dan interface repository/provider. |
| `data` | RPC gateway, mapping DTO/form, serialisasi dan state remote. | Drizzle repository dan adapter provider; tidak menentukan alur UI. |

Di backend, file langsung berada dalam folder fitur dengan akhiran `.<layer>.ts`; tidak ada folder terpisah untuk layer. Frontend tetap memakai folder layer seperti pada struktur di bawah. Dependensi mengarah dari presentation ke application ke data melalui interface. Infrastruktur bersama dan kontrak merupakan fondasi komposisi, bukan layer bisnis keempat. Antarfitur menggunakan interface publik, bukan impor internal feature lain.

## Struktur target

```text
credit-system/
  AGENTS.md
  pnpm-workspace.yaml
  turbo.json
  biome.json
  apps/
    server/src/features/<feature>/
      routes.presentation.ts
      service.application.ts
      repository.data.ts
    server/src/infrastructure/
    web/src/features/<feature>/{presentation,application,data}/
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
