# Frontend credit-system

- Gunakan React, Vite, Mantine dan Zod. Terapkan layer per fitur: `presentation` → `application` → `data`.
- Komponen presentasi memakai hook/use case; akses Hono RPC dan mapping DTO berada di layer data.
- Pertahankan alur aktor, status, pengajuan, simulasi, rekening dan dokumen di `docs/credit-system/business-flow.md` dan `docs/credit-system/features.md`.
- Jangan menyamakan pembatasan tombol/menu dengan otorisasi API. Tampilkan loading, sukses dan kegagalan sesuai hasil operasi.
- Uji rumus, validasi dan mapping dengan Vitest unit; uji form, navigasi, hak tampilan dan state dengan Vitest integration.
