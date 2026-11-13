# Verifikasi dan acceptance

Sumber tunggal cakupan test dan bukti hasil. Jadwal task verifikasi ada pada development-plan.md; cara menyiapkan lingkungan/perintah pada local-development.md.

## Cakupan acceptance

| Area | Vitest/unit/integration | E2E fullstack |
| --- | --- | --- |
| Fondasi, referensi, auth | DTO nullable, bcrypt/JWT, akun nonaktif, ACL aksi tepat, dua tenant, token salah/kedaluwarsa, fallback API/aset | Login tiga aktor, logout, URL langsung, halaman tidak ditemukan |
| CRUD admin/perusahaan | Konflik, role, ownership child, array kosong, rollback SQL child, deletion guard seeded debitor | Empat page, field error, save gagal/sukses, filter/sort/pagination, unduhan PDF/XLSX |
| Registrasi/profil (P05) | Validasi/mapping, isolasi tenant, dokumen wajib, gagal upload, guard kredit setelah P06 | Registrasi-login-profil-dokumen dan HRD CRUD |
| Pengajuan/approval (P06–P08) | Contoh hitung independen, batas tenor, pembagi nol, nominal, field/peran, transisi, snapshot/notifikasi idempoten dan rollback | HRD/BPR approve/reject/completed, lock form dan request lintas tenant |
| Konfirmasi/dokumen/ekspor (P09–P11) | Precondition dua approval, nama/rekening, waktu server, nomor/rerender/konkurensi, PDF nyata, filter/scope CSV/ZIP, gagal storage | Pembatalan, rekening, PDF tersimpan, unduhan/ZIP termasuk kosong/gagal |
| Dashboard (P12) | Agregasi status dan nominal sesuai aktor | Ringkasan serta regresi seluruh fitur tersedia |

Test bisnis memakai contoh numerik independen dari implementasi. Adapter storage/WhatsApp/PDF deterministik digunakan pada suite umum; renderer nyata diuji terpisah. Jangan mengirim notifikasi atau dokumen sintetis ke provider produksi.

Integration menggunakan MySQL disposable dan data sintetis. Uji service untuk aturan bisnis/rollback, repository untuk query/mapping, dan API langsung untuk otorisasi; tombol tersembunyi bukan bukti keamanan. Frontend menggunakan provider aplikasi dan memeriksa loading/kosong/gagal/sukses.

Instruksi E2E ada di [tests/e2e/AGENTS.md](../../tests/e2e/AGENTS.md).

## Bukti terakhir

| Verifikasi | Hasil tercatat |
| --- | --- |
| Audit duplikasi, 13 November 2026 | Lint, typecheck workspace/tooling dan pemeriksaan tipe test lulus; build lulus, 23 unit, 14 integration dan 20 E2E lulus. MySQL disposable, migration/seed, aplikasi native. Percobaan awal unit gagal karena import Hono dari workspace test; diperbaiki. Integration awal kekurangan JWT_SECRET; diulang dengan konfigurasi sintetis. E2E awal menemukan pool ditutup per test; fixture kini menutup sekali saat worker berakhir. WhatsApp nyata tidak diuji. |
| Koreksi created_at | Migration 0006, seed, lint, typecheck, build, 23 unit dan 18 integration lulus pada MySQL disposable. Test memeriksa default insert dan perilaku update SQL serta Drizzle untuk created_at/updated_at pada 24 tabel. |
| Auto-update audit | Migration 0005 dan seed pada MySQL disposable lulus; 48 kolom diverifikasi melalui information_schema, update SQL mentah dan Drizzle, lalu 18 integration dan 23 unit lulus. Lint, typecheck dan build lulus. Percobaan awal memeriksa tabel internal Drizzle dan diperbaiki untuk membatasi pemeriksaan ke tabel aplikasi. |
| P09-T04, 13 November 2026 | Lint, typecheck dan build lulus; 23 unit, 16 integration dan 21 E2E lulus dengan MySQL disposable, migration dan seed. Alur nasabah mencakup validasi rekening/nama, pembatalan, pengulangan dan penolakan API lintas tenant. E2E awal gagal karena navigasi reload menghapus sesi in-memory; test diperbaiki memakai navigasi aplikasi dan dijalankan ulang. DATE hanya menyimpan tanggal acknowledgment. |
| P08-T05, 13 November 2026 | Setelah memisahkan form dari halaman detail, lint, typecheck, build dan E2E review tiga keputusan kembali lulus. Pengiriman WhatsApp nyata tetap tidak diuji. |
| P08-T04, 13 November 2026 | Lint, typecheck dan build lulus; 19 unit, 14 integration dan 19 E2E lulus pada MySQL disposable credit_p08_test setelah migration dan seed dua kali. Perhitungan pecahan, snapshot, tiga keputusan BPR, role, pengulangan dan alur browser diuji. Pengiriman WhatsApp nyata dan adapter Meta tidak diuji sesuai instruksi pengguna. |
| P07-T03, 13 November 2026 | Lint, typecheck dan build lulus; 18 unit, 11 integration dan 18 E2E lulus pada MySQL disposable credit_p07_test setelah migration dan seed dua kali. Keputusan approved/rejected, request aktor lain/lintas tenant, field terlarang, lock dan keputusan bersamaan diuji. Suite integrasi diserialkan karena fixture memakai tenant bersama; eksekusi paralel awal mengalami konflik lock. Migration awal dicoba saat MySQL belum siap dan berhasil setelah server siap. E2E memakai Chrome lokal. |
| P06-T04, 13 November 2026 | Lint, typecheck dan build lulus; 17 unit, 8 integration, 17 E2E lulus pada MySQL disposable credit_p06_test setelah migration 0000–0003 dan seed dua kali. Cakupan kredit mencakup contoh hitung, tenor/zero, input terlarang, upsert child, rollback, scope tenant, guard hapus, lock approval serta alur simulasi/create/filter/edit browser. E2E dijalankan dengan Chrome lokal; percobaan awal tanpa executable browser gagal dan satu redirect gagal saat build paralel, kemudian suite lengkap lulus setelah build selesai. |
| P05-T04, 12 November 2026 | Lint, typecheck seluruh workspace/tooling/test dan build lulus; 14 unit, 7 integration, 16 E2E lulus pada MySQL disposable credit_p05_test setelah migration 0000–0002 dan seed dua kali. |
| P05 kegagalan dan konkurensi | Konflik username bersamaan menghasilkan satu akun; save profil bersamaan tidak menggandakan child. SQL child gagal mengembalikan perubahan parent; storage gagal membersihkan file baru dan mempertahankan dokumen lama. API lintas tenant/field internal/file palsu ditolak. Registrasi-login-profil-lima dokumen-unduh dan HRD CRUD diuji di browser nyata. |
| Migration ACL 0001 | Role WRITE lama dengan READ yang sudah ada menghasilkan tepat satu aksi CRUD per program tanpa Approval; seed dua kali tidak menggandakan role. |
| Probe declaration dependency | Pemeriksaan tanpa skipLibCheck gagal; rincian masalah aktif hanya di logic-holes.md. |

Ini bukti pada revisi tersebut, bukan jaminan test telah dijalankan ulang setelah perubahan selanjutnya. Histori hasil phase ada pada commit task di development-plan.md, bukan diulang sebagai log panjang di sini. Pekerjaan P09–P12 belum diklaim lulus. Warning build dependency Zod dan ukuran chunk frontend tetap muncul. Tidak ada script test sementara yang disimpan.
