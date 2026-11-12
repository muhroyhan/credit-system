# Frontend credit-system

- Gunakan React, Vite, Mantine dan Zod. Terapkan layer per fitur: `presentation` â†’ `application` â†’ `data`.
- Simpan hook di `<feature>/hooks` dan file lainnya langsung di folder fitur. Komponen yang diimpor router bernama `FeaturePage.tsx`; layer API bernama `feature.api.ts`. Subfolder fitur lainnya digunakan untuk komponen atau utilitas khusus fitur; komponen dan utilitas bersama berada di `src/components` dan `src/utils`.
- Komponen presentasi memakai hook/use case; akses Hono RPC dan mapping DTO berada di layer data.
- Pertahankan alur aktor, status, pengajuan, simulasi, rekening dan dokumen di `docs/credit-system/business-flow.md` dan `docs/credit-system/features.md`.
- Jangan menyamakan pembatasan tombol/menu dengan otorisasi API. Tampilkan loading, sukses dan kegagalan sesuai hasil operasi.
- Uji rumus, validasi dan mapping dengan Vitest unit; uji form, navigasi, hak tampilan dan state dengan Vitest integration.

- Gunakan TanStack Router untuk routing aplikasi dan TanStack Query untuk data API: query key mencakup parameter dan sesi, mutation menginvalidasi query terkait. Bersihkan cache saat logout. Gunakan React Hook Form dan Zod resolver untuk state dan validasi form, tampilkan error pada setiap field, dan cegah submit saat invalid.

- Fitur CRUD memiliki empat page terpisah: `FeaturePage.tsx` (listing, sorting, pagination, filter, row actions, tambah, ekspor PDF/XLSX), `FeatureAddPage.tsx`, `FeatureEditPage.tsx` (form), dan `FeatureViewPage.tsx` (detail berupa teks, tanpa input disabled). Komponen form dapat dipakai bersama add/edit.
- Semua akses halaman dan action mengikuti CRUDA (Create, Read, Update, Delete, Approval) sesuai izin API. Untuk Admin User: USA_READ memberi Read dan ekspor; USA_CREATE/UPDATE/DELETE memberi aksi masing-masing, dan USA_APPROVAL harus diberikan eksplisit. endpoint approval belum tersedia. Gate halaman harus mencegah mount/query konten terlarang termasuk saat akses URL langsung. Dashboard adalah fitur terpisah dari auth.

- Simpan schema Zod, deklarasi type dan interface tiap fitur dalam satu file `<feature>.type.ts` di folder fitur; konsumen menggunakan `import type` untuk type dan import biasa untuk schema. Kontrak bersama tetap di `packages/contracts`.
