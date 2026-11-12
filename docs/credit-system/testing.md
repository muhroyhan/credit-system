# Pengujian credit-system

Ini adalah rencana acceptance; test, script, fixture dan infrastruktur test belum tersedia sampai implementasi dibuat. Gunakan database disposable dan data sintetis untuk seluruh test. Jangan mengirim notifikasi atau file test ke layanan produksi.

Jalankan Vitest, Playwright, browser dan aplikasi yang diuji secara native di host. Docker dapat menjalankan service MySQL lokal untuk test, dengan database test disposable yang terisolasi dari database development; jangan menjalankan aplikasi atau test runner dalam container. Konfigurasi dan perintahnya masih perlu dibuat dan diverifikasi.

## Vitest unit

- Uji rumus angsuran dan total, score, penjumlahan status `pending`/`approved`, biaya `%`/`x`/nilai langsung, perhitungan biaya dan pembulatan dengan contoh numerik independen.
- Uji Zod request/response, mapping nominal/tanggal/DTO, permission menu, filter tenor dan batas Rp8.000.000; sertakan tenor yang tidak tersedia dan pembagi nol.
- Periksa perbedaan perilaku yang tercatat di [logic-holes.md](logic-holes.md). Karakterisasi tidak berarti celah keamanan wajib dipertahankan.

## Vitest integration backend dan frontend

- Backend: Hono app dan Drizzle terhadap MySQL disposable; bcrypt dan JWT nyata; fixture dua perusahaan dan seluruh aktor. Uji auth, konfigurasi perusahaan, profil/dokumen, create/update kredit, kedua approval, snapshot biaya, rekening, perjanjian, ekspor dan deletion guard.
- Gunakan adapter storage, WhatsApp dan PDF deterministik dalam test umum. Uji renderer PDF yang sebenarnya secara terpisah dengan data sintetis, termasuk konten dan hasil unduhan.
- Frontend: render dengan provider yang dipakai aplikasi dan test boundary jaringan; uji form, permission, validasi, loading, sukses/gagal, filter, pagination, acknowledgment dan navigasi.
- Uji efek kegagalan upload/notifikasi/PDF dan request berulang; catat hasil yang menjadi keputusan kompatibilitas. Test isolasi tenant dan batas akses harus menguji API langsung, bukan hanya menu.

## Playwright E2E fullstack

Jalankan browser terhadap server monolit dan database test yang berjalan; API aplikasi tetap nyata. Provider eksternal dapat digantikan adapter lokal deterministik. Verifikasi:

1. Registrasi, login, profil dan dokumen, pengajuan dan status HRD awal.
2. HRD menyetujui, BPR meninjau dan menyetujui, snapshot biaya dan notifikasi tercatat.
3. Debitor mengisi rekening dan menyetujui; PDF terbentuk, URL tersimpan dan dokumen dapat diunduh.
4. HRD menolak; BPR menolak; debitor membatalkan; BPR menandai `completed`.
5. CRUD perusahaan/admin/debitor, hak program, filter/sort/pagination, CSV, PDF individual dan ZIP terfilter.
6. Isolasi dua tenant, request langsung, kegagalan simpan, unggah, notifikasi dan PDF, serta submit ulang.

Gunakan clock dan timezone terkontrol. Simpan trace ketika gagal dan pastikan fixture dibersihkan agar suite dapat diulang. Setelah script tersedia, jalankan lint, typecheck, unit/integration, build dan E2E yang relevan, lalu laporkan hasil aktual.

## Hasil P04

Task P04-T03: MySQL 8.4 disposable `credit_p04_test`; migration berhasil dan seed sintetis dijalankan dua kali. Lint, typecheck, build lulus; 8 unit, 6 integration, 11 E2E lulus. Cakupan baru: validasi bunga/tenor, password create, konflik perusahaan, penolakan ID child tenant lain, rollback setelah kegagalan SQL child, array kosong menghapus seluruh konfigurasi, deletion guard seeded debitor, USC READ/WRITE dan scope bunga tenant. E2E mengisi bunga/biaya, memeriksa error field, detail teks dan menyimpan array kosong. Selektor password wajib diperbaiki setelah kegagalan awal; regresi seluruh E2E kemudian lulus. Tidak ada script test sementara atau migration baru.

Audit layer setelah P04: error bisnis dan orkestrasi transaksi dipindahkan ke service; integration Admin User/Perusahaan memanggil service untuk konflik, ownership dan rollback SQL child. Lint/typecheck/build, 8 unit, 6 integration dan 11 E2E lulus dengan MySQL disposable credit_layer_test. Tidak ada throw eksplisit atau pembukaan transaksi dalam repository. Error teknis driver tetap diteruskan agar transaksi rollback.

Audit route/ACL: migrasi dan seed MySQL disposable, 10 unit, 6 integration dan 12 E2E lulus; E2E mencakup ACL CREATE dan APPROVAL pada program yang sama, izin DELETE/READ ditolak, serta role WRITE lama.
