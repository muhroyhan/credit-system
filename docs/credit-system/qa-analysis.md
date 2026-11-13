# Analisis QA P13

Audit 13 November 2026 pada branch `test/refine-automation-testing`.
Lingkup: source aplikasi, kontrak, persistence, konfigurasi runner, fixture,
test yang sudah ada, dan dokumen bisnis/API/model. Tidak ada perubahan pada
`apps/*` maupun schema/migration/seed database dalam pekerjaan ini.

## Peta sistem dan batas pengujian

| Lapisan | Perilaku yang dianalisis | Strategi bukti |
| --- | --- | --- |
| Bun/Hono | Prefix API tunggal, fallback SPA/aset, controller dan pemetaan error | Request ke app nyata; HTTP ke proses Bun untuk bcrypt dan fallback |
| Identitas | JWT HS256, expiry, claim, akun aktif dan role terbaru dimuat per request | Token fixture ditandatangani independen, resolver palsu di unit, akun/role nyata di integration HTTP |
| Kontrak | Zod, field strict pada employee/kredit, DTO nullable, pagination, enum bersama | Partisi input valid/invalid, batas integer/panjang, input field milik server |
| Service/repository | Transaksi parent/child, ownership, scope filter dan rollback | MySQL disposable nyata; snapshot sebelum/sesudah penolakan; kegagalan SQL child |
| UI | React Hook Form/Zod, TanStack Query/Router, CRUDA, sesi dalam memori | Browser dengan provider aplikasi, validasi form, detail teks, konflik server, redirect dan unduhan |
| Kredit | Flat bulanan, batas Rp8 juta/12 bulan, score informatif | Contoh numerik independen, nominal terformat, rounding dan overflow |
| Approval | HRD pending ke approved/rejected; BPR tiga keputusan; snapshot biaya | Matriks status/aktor, permintaan ulang/bersamaan, snapshot tetap saat completed |
| Nasabah | Dua approval, nama persis, rekening, tanggal server, pembatalan | Semua 25 pasangan status HRD/BPR termasuk null; satu pasangan diizinkan dan 24 ditolak |
| Dokumen | Nomor bulanan atomik, konfirmasi lengkap, PDF privat, retry/kompensasi | Concurrent issuance, PDF A4 nyata, renderer/storage gagal, download tanpa penerbitan |
| Pelaporan | CSV/PDF/XLSX/ZIP, filter/scope, tanpa pagination | Parse ulang XLSX dan ZIP, isi PDF, escape CSV, arsip kosong/hilang dan batas lima read |
| Dashboard | Total perusahaan active/inactive global, debitor scoped, nominal menurut HRD | Delta terhadap baseline sintetis, BigInt, aktor dan status; cancellation tidak mengubah HRD |

Unit tidak membuka SQL atau mengirim jaringan eksternal. Integration menguji
kerja sama modul dan dependency nyata; transport WhatsApp dipalsukan secara
eksplisit. E2E memakai browser, API, Bun dan MySQL nyata tanpa intercept/mock API
aplikasi. Setup data boleh melalui SQL/API; perilaku UI yang dinyatakan diuji
tetap dilakukan melalui browser.

## Cleanup yang diterapkan

- Lima perjalanan API murni dipindah dari E2E ke integration HTTP; test JWT
  kedaluwarsa dipisah dari perjalanan halaman tidak ditemukan. Skenario role
  revalidation ditambahkan di boundary HTTP Bun.
- Renderer PDF dengan dependency nyata dipindah dari unit ke integration.
- Adapter contoh yang hanya dipakai test untuk menguji adapter itu sendiri
  dihapus dari package test-utils beserta ekspor dan test-nya.
- Kasus administrator, perusahaan, profil, kompensasi upload dan ZIP dipecah
  agar kegagalan menunjukkan perilaku yang gagal. Test atomisitas/transaksi
  tetap memeriksa parent dan child bersama bila itu satu invariant.
- Penutupan pool Vitest dipusatkan pada setup per file; Playwright SQL menutup
  pool di akhir worker. Fixture kredit menghapus seluruh tipe child; employee
  dibersihkan melalui service. CRUD UI/API yang sebelumnya belum terlindungi
  kini memakai `finally` untuk pembersihan record.
- Konfigurasi test yang tidak lengkap gagal sebelum koneksi/server dimulai;
  suite tidak menghasilkan laporan hijau dengan database test terlewati.
  Direktori dokumen dibatasi ke `.data/qa`, timezone Asia/Jakarta, token provider
  nyata ditolak, dan Bun test tidak memuat berkas environment otomatis.
- Integration SQL, integration HTTP dan browser dieksekusi berurutan karena
  seed tenant dipakai bersama. Satu worker Playwright menghindari interferensi
  aggregate dan konflik fixture.

## Temuan dan batas keputusan

| Temuan | Kebutuhan / implementasi / hasil audit | Tindak lanjut |
| --- | --- | --- |
| Schema bunga lebih permisif daripada simulator | Analisis statis: schema memakai konversi Number sedangkan simulator mensyaratkan string desimal tertentu. Bentuk seperti notasi eksponen atau whitespace dapat tersimpan sebagai konfigurasi tetapi ditolak ketika simulasi. Bukan perbaikan bisnis dalam P13. | QA-01 pada logic-holes; putuskan normalisasi atau pembatasan input sebelum perubahan |
| Konflik identitas administratif | Service melakukan pemeriksaan sebelum write; constraint unik fisik untuk seluruh identitas belum tersedia. Test konflik berurutan lulus, bukan bukti race create admin/perusahaan telah diselesaikan. | SUPPORT-05 tetap terbuka |
| Notifikasi setelah commit | Transport sukses, HTTP gagal dan jaringan gagal diuji tanpa provider nyata; approval/snapshot tetap tersimpan dan permintaan ulang tidak mengirim lagi. | FLOW-04 tetap mencatat tidak adanya antrean/retry persisten |
| Kebijakan kompatibilitas | Status perusahaan pada login debitor, slug publik semua status, self-delete admin, score informatif, tabungan tetap dan completed langsung tetap mengikuti kode/keputusan yang ada. | SUPPORT-03/11/16 dan FLOW-07/08/09 tidak diperketat diam-diam |
| Dokumen kebutuhan tertinggal | Beberapa pembuka API/logic-holes masih menyebut P06–P12 belum tersedia atau DKN rancangan, sementara source dan suite telah mencakupnya. | QA-DOC-01; hasil P13 pada testing.md membuktikan revisi ini, bukan mengganti keputusan bisnis |
| Kedalaman pengujian | Kasus berbatas dicakup melalui equivalence partition, boundary values, matriks peran/status, kegagalan dependency dan konkurensi. | Tidak mengklaim seluruh input tak terbatas, seluruh interleaving, atau coverage baris 100% |

Belum diverifikasi: WhatsApp/Meta nyata, browser Firefox/WebKit, viewport mobile,
visual/a11y menyeluruh, performance/load/soak, fuzzing, backup/restore dan migrasi
data produksi. State loading/gagal setiap hook frontend belum seluruhnya diuji
secara terisolasi; perjalanan browser yang tercatat tetap diuji secara nyata.

Happy path, variasi dan tautan suite ada pada [test-cases.md](test-cases.md).
Hasil aktual ada pada [testing.md](testing.md); perintah hanya pada runbook lokal.

Pemeriksaan SQL setelah suite terakhir: 2 admin, 2 perusahaan dan 2 debitor seed;
0 kredit dan 0 snapshot biaya. Storage QA berisi 0 file. Container disposable
telah dihentikan/dihapus dan berkas environment sementara serta direktori
dokumen kosong telah dibersihkan sebelum commit verifikasi.
