# Rencana pengembangan

Daftar phase, task dan pelacakan commit; aturan pelaksanaan berada di [AGENTS.md](../../AGENTS.md). P00–P08 selesai; P09–P12 belum dikerjakan. Bukti test terakhir hanya di [testing.md](testing.md); sumber konteks lain ada pada AGENTS.md root.

## Phase dan dependensi

| Phase | Fitur/keluaran mandiri | Bergantung pada |
| --- | --- | --- |
| P00 | Fondasi monolit dan database lokal | — |
| P01 | Data referensi dan bootstrap akun sintetis | P00 |
| P02 | Login, identitas dan navigasi aktor | P01 |
| P03 | Admin User dan hak program | P02 |
| P04 | Perusahaan, bunga dan biaya | P02 |
| P05 | Registrasi dan Master Karyawan | P04 |
| P06 | Pengajuan kredit dan simulasi | P05 |
| P07 | Persetujuan HRD | P06 |
| P08 | Review BPR, snapshot biaya dan notifikasi | P07 |
| P09 | Status nasabah, pembatalan dan rekening | P08 |
| P10 | Perjanjian, PDF dan halaman terima kasih | P09 |
| P11 | Ekspor CSV dan ZIP dokumen | P10 |
| P12 | Dashboard aktor | P08 |

P03 dan P04 independen setelah P02. P12 tidak membutuhkan P09–P11; regresi lintas fitur dilakukan pada phase yang selesai paling akhir. P09 menyimpan konfirmasi; pembuatan dokumen baru disambungkan P10. CSV/ZIP P11 melengkapi ekspor PDF/XLSX fitur yang telah tersedia.

## Task selesai P00–P04

| Task | Status | Keluaran | Commit |
| --- | --- | --- | --- |
| P00-T01 | done | Workspace/stack dan struktur awal | e86d326 |
| P00-T02 | done | Serving monolit, proxy dan fallback SPA | 1bdb31b |
| P00-T03 | done | MySQL lokal serta runner migration/seed | d5d48cb |
| P00-T04 | done | Konfigurasi test dan adapter sintetis | b83abfa |
| P00-T05 | done | Verifikasi fondasi | 97cacf1 |
| P01-T01 | done | Schema dan migration awal | a065f00 |
| P01-T02 | done | Seed sintetis | 2e92f6e |
| P01-T03 | done | Referensi dan DTO | 7d830d7 |
| P01-T04 | done | Verifikasi referensi/migration/seed ulang | 0b0da39 |
| P02-T01 | done | Login tiga aktor | 5eea57f |
| P02-T02 | done | Identitas dan hak program | 983acc2 |
| P02-T03 | done | Login UI dan shell | ad2cb5f |
| P02-T04 | done | Verifikasi autentikasi | 10e54ee |
| P03-T01 | done | CRUD admin/role | cf18ce5 |
| P03-T02 | done | API dan form admin | e400994 |
| P03-T03 | done | Verifikasi admin | 24d0c17 |
| P04-T01 | done | Transaksi konfigurasi perusahaan | e18541b |
| P04-T02 | done | API berizin dan empat page perusahaan | 51e14d9 |
| P04-T03 | done | Verifikasi perusahaan | 14883bb |

Footer task dapat ditelusuri dengan `git log --all --grep='Task: Pxx-Tyy'`. Refactor setelah phase tercatat dalam histori git; tidak disalin sebagai log task baru di sini. Standar teknis dan kontrak terkini mengungguli struktur awal pada commit historis.

## P05 — Registrasi dan Master Karyawan

Status: done. P05-T01: 60d9625; P05-T02: 3a1ce1c; P05-T03: 9a544e0; P05-T04: lihat footer commit Task: P05-T04. Bukti verifikasi pada testing.md.

Hasil: nasabah mendaftar melalui slug, login setelah registrasi dan melengkapi identitas/penghasilan/dokumen; HRD mengelola karyawan perusahaannya.

| Kode task | Task dan keluaran |
| --- | --- |
| P05-T01 | Lengkapi schema/migration `debitor` serta `debitor_data`, `debitor_family`, `debitor_financial`, `debitor_gps`, `debitor_others`, `debitor_slik`; catat tipe NUMBER/telepon, koordinat, nominal dan relasi 1:1. Data tambahan tidak menjadi form wajib baru. |
| P05-T02 | Implementasikan registrasi publik melalui slug, HRD create, detail/update/delete dan daftar debitor; kontrak payload publik berbeda dari field kelolaan internal. Terapkan transaksi, scope aktor, audit dan guard kredit yang diaktifkan bersama tabel credit P06; jangan menampilkan aksi hapus tanpa guard saat kredit tersedia. |
| P05-T03 | Implementasikan profil, penghasilan dan lima dokumen wajib serta NPWP opsional, adapter upload dan penyimpanan URL; perbaiki mapping slip gaji/tanda tangan. Buat form registrasi/profil dan tabel Master Karyawan, filter nama/alias, sort, pagination dan validasi sukses sebelum lanjut. Catat FLOW-12, SUPPORT-13, FE-02/09/10/16. |
| P05-T04 | Verifikasi akhir phase: unit validasi/mapping, integration registrasi/profil/upload dan scope dua tenant, E2E registrasi-login-profil-dokumen serta HRD CRUD. Uji file gagal dan larangan akses langsung; deletion guard kredit diverifikasi P06 setelah tabel tersedia. |

## P06 — Pengajuan kredit dan simulasi

Hasil: pengajuan dan simulasi nasabah/HRD dapat dipakai dengan status HRD awal pending, tanpa membutuhkan review BPR.

Status: done. P06-T01: b27e9e3; P06-T02: e4b11ca; P06-T03: b8cd2d8; P06-T04: lihat footer commit Task: P06-T04. Bukti verifikasi pada testing.md.

| Kode task | Task dan keluaran |
| --- | --- |
| P06-T01 | Buat schema/migration `credit`, `credit_collection`, `credit_guarantor`, `credit_insurance`, `credit_potongan`, `credit_slik_bmpk`, `credit_spouse`; tetapkan mapping child/upsert dan aktifkan guard penghapusan debitor yang memiliki kredit. |
| P06-T02 | Implementasikan use case hitung angsuran flat, total angsuran, pengajuan terbuka dan score informatif; parsing nominal konsisten serta validasi tenor tersedia/zero dan batas Rp8.000.000. Catat FLOW-08/14, SUPPORT-10, FE-01/11 tanpa mengubah formula. |
| P06-T03 | Implementasikan create/detail/list/update pengajuan sesuai aktor, DTO turunan, filter/pagination dan lock edit; tolak field approval/biaya dari pengaju. Buat form, simulasi dan tabel bunga, detail dan list Pengajuan Kredit. Pasang izin CGP dan pemetaan tanggal/acknowledgment yang benar. |
| P06-T04 | Verifikasi akhir phase: unit contoh numerik independen termasuk Rp12 juta/12 bulan/1%, batas tenor dan pembagi nol; integration create/update/child/ownership/guard debitor; E2E pengajuan pending dan edit dengan filter. |

## P07 — Persetujuan HRD

Hasil: HRD meninjau dan menyetujui/menolak pengajuan perusahaan sendiri; keputusan tersimpan tanpa bergantung layar BPR.

Status: done. P07-T01: 0d88281; P07-T02: c83654d; P07-T03: lihat footer commit Task: P07-T03. Bukti verifikasi pada testing.md.

| Kode task | Task dan keluaran |
| --- | --- |
| P07-T01 | Tambahkan use case approve/reject HRD pada kontrak update kredit; izin field/peran, scope perusahaan, lock approved/rejected dan audit server. Catat transisi yang ambigu pada FLOW-01/02/03 sebelum memutuskan perilaku. |
| P07-T02 | Hubungkan detail pengajuan dan aksi konfirmasi HRD, state sukses/gagal serta refresh daftar; pertahankan penguncian UI dan backend sesuai keputusan terdokumentasi. |
| P07-T03 | Verifikasi akhir phase: unit status, integration approve/reject dan request langsung oleh aktor lain, E2E HRD menyetujui/menolak serta mencegah perubahan setelah terkunci. |

## P08 — Review BPR dan notifikasi

Hasil: BPR meninjau kredit yang disetujui HRD, menetapkan status, menghasilkan snapshot biaya dan notifikasi melalui adapter.

Status: done. Commit task ditelusuri melalui footer Task: P08-T01 sampai P08-T05. Pengiriman WhatsApp nyata belum diuji sesuai instruksi pengguna; bukti lainnya pada testing.md.

| Kode task | Task dan keluaran |
| --- | --- |
| P08-T01 | Buat schema/migration `credit_expense`, DTO review dan repository transaksi; implementasikan biaya persen/x/langsung dari data tersimpan yang lengkap. Pertahankan asuransi, materai dan tabungan sesuai rumus; catat FLOW-04/05/09 dan FE-06. |
| P08-T02 | Implementasikan approved/rejected/completed BPR, perubahan HRD ke rejected saat penolakan BPR, lock form serta snapshot approval; jangan mensyaratkan approved sebelumnya untuk completed tanpa keputusan bisnis. Tetapkan perilaku request berulang dan kegagalan notifikasi secara tercatat. |
| P08-T03 | Buat adapter WhatsApp untuk tautan status nasabah dan implementasi produksi berdasarkan konfigurasi/provider terverifikasi; gunakan adapter deterministik untuk test. Buat Daftar Kredit Karyawan, default HRD approved, filter perusahaan/debitor/status, detail identitas/score, form nominal/tenor/asuransi/status dengan DKN_CREATE/READ/UPDATE/DELETE/APPROVAL. |
| P08-T04 | Verifikasi akhir phase: unit biaya/score/status, integration transaksi snapshot, pengulangan request dan gagal notifikasi, E2E approved/rejected/completed dan lock form. Uji kebocoran tenant dan field approval melalui API. |
| P08-T05 | Pisahkan halaman detail dan form keputusan BPR sesuai standar page; verifikasi ulang lint, typecheck, build dan alur browser review. |

## P09 — Status nasabah, pembatalan dan rekening

Hasil: nasabah dapat melihat status, membatalkan atau menyimpan rekening/persetujuan sesudah dua approval. Pembuatan dokumen disambungkan P10.

| Kode task | Task dan keluaran |
| --- | --- |
| P09-T01 | Implementasikan use case status dan pembatalan: BPR menjadi rejected, HRD tidak diubah, acknowledgment memakai waktu server. Dokumentasikan konsekuensi agregat pengajuan terbuka/dashboard (FLOW-07/13). |
| P09-T02 | Implementasikan simpan empat field rekening, checkbox kebenaran data dan konfirmasi nama persis sama; validasi ownership dan kedua approval di backend. Petakan tambahan payload eksplisit dalam api-contract, jangan bergantung validasi client saja (FLOW-06, FE-03). |
| P09-T03 | Buat halaman status, aksi batal/lanjut, rincian biaya dan form rekening; simpan sukses sebelum melanjutkan, tangani gagal simpan dan submit berulang. Sediakan hasil konfirmasi tersimpan tanpa mengklaim PDF sudah terbentuk. |
| P09-T04 | Verifikasi akhir phase: unit nama/biaya/status, integration precondition dan waktu server, E2E pembatalan dan rekening berhasil/gagal termasuk request lintas tenant. |

## P10 — Perjanjian, PDF dan halaman terima kasih

Hasil: sesudah rekening tersimpan, dokumen dibentuk, URL disimpan dan halaman terima kasih/unduhan tersedia.

| Kode task | Task dan keluaran |
| --- | --- |
| P10-T01a | doing | Siapkan fungsi tanggal dan terbilang serta unit test; pengujian pada P10-T04. |
| P10-T01 | Tetapkan kontrak render/count, penomoran global berdasarkan bulan created_at, format nomor, tanggal acknowledgment/angsuran pertama/akhir tenor dan terbilang. Putuskan penanganan konkurensi/render ulang, label bunga/denda dan string null dalam logic-holes sebelum perubahan kompatibilitas (FLOW-10, FE-07/08). Jika keputusan membutuhkan kolom/tabel, sertakan migration Drizzle pada task ini. |
| P10-T02 | Buat template perjanjian delapan pasal/surat persetujuan A4, adapter PDF dan storage, route render/count dengan scope akses dan penyimpanan doc_url. Kelola browser/resource, sumber URL dan kegagalan upload secara eksplisit (FLOW-11, SUPPORT-12). |
| P10-T03 | Hubungkan simpan rekening sukses ke pembuatan PDF, halaman dokumen, unduh individual dan terima kasih; gunakan kondisi acknowledgment+BPR approved+doc_url, tunggu fetch selesai sebelum redirect. Tangani kegagalan render tanpa keberhasilan palsu (FE-04/15). |
| P10-T04 | Verifikasi akhir phase: unit nomor/tanggal/biaya, integration renderer PDF nyata terpisah dari adapter deterministik, E2E perjalanan registrasi hingga unduh dokumen. |

## P11 — Ekspor CSV dan ZIP

Hasil: ekspor perusahaan, debitor, kredit dan dokumen mengikuti filter, sort dan lingkup aktor pada layar sumber yang sudah tersedia.

| Kode task | Task dan keluaran |
| --- | --- |
| P11-T01 | Implementasikan endpoint export perusahaan/debitor/kredit dan format kredit-karyawan; CSV mengikuti filter/sort tanpa pagination, memuat field kontrak serta nominal/status/rekening/tanggal yang sesuai. Hubungkan tombol unduh ke list terkait. |
| P11-T02 | Implementasikan ZIP dokumen dengan filter tanggal/debitor/perusahaan sesuai aktor, hanya doc_url tersedia, maksimal lima pengambilan paralel, penamaan file dan response URL/nama. Tangani dokumen kosong serta kegagalan fetch/storage dengan pembatasan akses sumber yang tercatat. |
| P11-T03 | Verifikasi akhir phase: unit format/filter, integration isi CSV/ZIP dan scope aktor, E2E unduhan sesuai filter termasuk kosong/gagal dan tanpa bocor tenant. |

## P12 — Dashboard aktor

Hasil: admin, HRD dan debitor melihat ringkasan sesuai kontrak, dengan navigasi yang sudah tersedia pada phase dependensinya.

| Kode task | Task dan keluaran |
| --- | --- |
| P12-T01 | Implementasikan agregasi totalUsers active/inactive tanpa blocked, totalDebitor sesuai aktor (nol bagi debitor), totalCredits berupa nominal per status HRD pending/approved/completed. Catat totalUsers global dan dampak cancellation sesuai SUPPORT-04/15, bukan mengubah agregat menjadi saldo cicilan. |
| P12-T02 | Pasang GET dashboard/data dan UI ringkasan sesuai aktor, state kosong/loading/gagal dan nominal/tanggal konsisten; gunakan query sesuai scope backend. |
| P12-T03 | Verifikasi akhir phase: unit agregasi, integration dua tenant/seluruh aktor dan status, E2E dashboard. Regresikan seluruh fitur yang telah selesai; jika P09–P11 belum dikerjakan, regresinya dilakukan pada task terakhir phase tersebut ketika selesai. Hapus script test sementara dan catat hasil aktual. |
