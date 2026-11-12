# E2E credit-system

- Gunakan Playwright dengan frontend, backend monolit dan database test yang berjalan; jangan mock API aplikasi pada skenario fullstack.
- Jalankan Playwright, browser dan aplikasi secara native di host; Docker hanya untuk service database MySQL lokal, dengan database test terisolasi dari database development.
- Gunakan data sintetis dan adapter lokal untuk provider eksternal; jangan memakai layanan atau data produksi.
- Cakup approval HRD/BPR, persetujuan nasabah, rekening, dokumen, penolakan, pembatalan, ekspor dan isolasi tenant sesuai `docs/credit-system/testing.md`.
- Buat waktu/timezone, fixture dan cleanup deterministik; simpan trace untuk investigasi kegagalan.
