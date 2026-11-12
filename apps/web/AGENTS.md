# Frontend credit-system

- Gunakan React, Vite, Mantine dan Zod. Terapkan layer per fitur: `presentation` → `application` → `data`.
- Komponen presentasi memakai hook/use case; akses Hono RPC dan mapping DTO berada di layer data.
- Pertahankan alur aktor, status, pengajuan, simulasi, rekening dan dokumen di `docs/credit-system/business-flow.md` dan `docs/credit-system/features.md`.
- Jangan menyamakan pembatasan tombol/menu dengan otorisasi API. Tampilkan loading, sukses dan kegagalan sesuai hasil operasi.
- Uji rumus, validasi dan mapping dengan Vitest unit; uji form, navigasi, hak tampilan dan state dengan Vitest integration.

- Gunakan TanStack Router untuk routing aplikasi dan TanStack Query untuk data API: query key mencakup parameter dan sesi, mutation menginvalidasi query terkait. Bersihkan cache saat logout. State form lokal tetap memakai React.
