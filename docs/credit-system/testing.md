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
| Audit Google TypeScript, 12 November 2026, commit 73deb33 | Lint, typecheck seluruh workspace/tooling/test dan build lulus; 10 unit, 6 integration, 12 E2E lulus pada MySQL disposable credit_style_test setelah migration/seed. |
| Migration ACL 0001 | Role WRITE lama dengan READ yang sudah ada menghasilkan tepat satu aksi CRUD per program tanpa Approval; seed dua kali tidak menggandakan role. |
| Probe declaration dependency | Pemeriksaan tanpa skipLibCheck gagal; rincian masalah aktif hanya di logic-holes.md. |

Ini bukti pada revisi tersebut, bukan jaminan test telah dijalankan ulang setelah perubahan selanjutnya. Histori hasil phase ada pada commit task di development-plan.md, bukan diulang sebagai log panjang di sini. Pekerjaan P05–P12 belum diklaim lulus. Perapian dokumentasi setelah audit ini hanya diperiksa untuk konsistensi dan tautan; tidak menjalankan ulang suite aplikasi.
