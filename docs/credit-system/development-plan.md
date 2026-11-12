# Rencana pengembangan credit-system

## Status dan sumber acuan

Dokumen ini adalah rencana implementasi, bukan laporan fitur atau test yang sudah selesai. Pada penyusunan rencana, repository berisi dokumentasi dan instruksi agen; manifest workspace dan script aplikasi belum ditemukan. Seluruh task di bawah berstatus belum dikerjakan.

Acuan ruang lingkup dan acceptance:

- [business-flow.md](business-flow.md): aktor, urutan persetujuan, status, rumus, rekening dan perjanjian.
- [features.md](features.md): fitur, form, hak program, filter dan batas cakupan.
- [architecture.md](architecture.md): stack, tiga layer, monolit dan lingkungan lokal.
- [api-contract.md](api-contract.md): endpoint, payload, DTO dan semantik response.
- [data-model.md](data-model.md): 24 entitas dan relasi konseptual; DDL belum terverifikasi.
- [logic-holes.md](logic-holes.md): risiko dan keputusan kompatibilitas yang harus dilacak.
- [testing.md](testing.md): cakupan Vitest dan Playwright serta isolasi data.
- [AGENTS.md root](../../AGENTS.md), [server](../../apps/server/AGENTS.md), [web](../../apps/web/AGENTS.md), [database](../../packages/database/AGENTS.md) dan [E2E](../../tests/e2e/AGENTS.md): aturan implementasi sesuai direktori.

## Aturan eksekusi dan pelacakan

1. Kode task menggunakan `Pxx-Tyy`; kode tetap dipertahankan meskipun jadwal berubah. Setiap baris task menghasilkan satu commit terfokus beserta pembaruan status task. Jika perlu dipecah, daftarkan subtask berkode sebelum dikerjakan dan commit setiap subtask.
2. Commit hanya pada custom branch. Sebelum mulai dan sebelum setiap commit, periksa `git branch --show-current`. Jika masih `main`, detached HEAD, atau belum ada custom branch, ingatkan pengguna dan tunda commit sampai berada di custom branch. Saat dokumen ini disusun, branch aktif adalah `main` dan belum ada custom branch. Contoh nama branch: `docs/development-plan` atau `feature/credit-application`.
3. Ikuti [Git Commit Best Practices](https://gist.github.com/Aditi3/a7a1ddd1ecef73dab548f7955210cfff): perubahan satu tujuan, commit kecil dan rutin, pesan jelas dengan format `<type>(<scope opsional>): <subject>`. Gunakan imperative huruf kecil tanpa titik akhir, subject maksimal 50 karakter dan body dibungkus pada 72 karakter. Tipe sesuai perubahan: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `build`, `perf`.
4. Letakkan kode task di footer commit agar subject tetap singkat. Contoh:

   ```text
   feat(auth): add tenant login

   Task: P02-T02
   ```

5. Catat untuk setiap task: status (`todo`, `doing`, `blocked`, `done`), hash commit, keluaran dan keputusan terkait. Commit implementasi sebelum task akhir phase diberi catatan belum diuji; phase baru selesai setelah task verifikasi terakhir lulus. Setelah commit, catat hash dalam laporan pelaksanaan atau task berikutnya agar tidak memerlukan hash commit itu sendiri di dalam commit.
6. Jalankan test hanya pada task terakhir setiap phase, setelah seluruh task implementasi phase selesai. Task implementasi boleh menyiapkan test permanen, tetapi tidak menjalankannya. Pada task terakhir, jalankan lint, typecheck, build dan suite relevan yang sudah didefinisikan; perbaikan dan pengulangan test tetap bagian task terakhir. Jangan menjalankan suite otomatis pada tiap task melalui hook atau pipeline branch; sediakan pemicu verifikasi akhir phase. Laporkan hasil aktual, bukan target.
7. File test permanen Vitest/Playwright dan fixture tetap disimpan. Jika membuat file script sementara untuk membantu test, hapus file tersebut sebelum commit task verifikasi; catat hasilnya. Jangan menghapus `seed.ts`, `migrate.ts`, atau test permanen karena aturan cleanup ini.
8. Setiap phase fitur mencakup backend dan frontend dalam layer `presentation`, `application`, `data`, kontrak Zod bersama, akses API sesuai aktor, serta UI loading/sukses/gagal. Ketergantungan hanya ke phase yang sudah selesai; fitur yang belum ada tidak boleh menjadi prasyarat tersembunyi. Data sintetis boleh disediakan melalui seed sebagai pengganti layar pengelolaan yang belum ada.
9. Catat keputusan dan dampak kompatibilitas di `logic-holes.md` pada task yang menyentuhnya. Perbaikan teknis tidak otomatis mengizinkan perubahan rumus, persetujuan, status atau syarat bisnis. Keputusan bisnis yang belum tersedia memblokir task terkait, sementara task independen dapat dilanjutkan.

## Database dan lingkungan pengembangan

- Docker hanya menjalankan service MySQL lokal. Bun/Hono, Vite, tooling, migration, seeding, Vitest, Playwright dan browser berjalan native di host. Hasil build frontend disajikan Hono/Bun sebagai satu deployment monolit.
- Sediakan `packages/database/src/seed.ts` dan script root `pnpm db:seed` yang menjalankannya melalui Bun. Gunakan Drizzle untuk seeding data referensi dan data sintetis yang dibutuhkan phase. Pisahkan dataset development/test, gunakan hash bcrypt, hindari rahasia tertanam dan buat eksekusi ulang terkendali tanpa menggandakan data. Seed test tidak boleh menyasar database development atau produksi.
- Saat membutuhkan tabel, sediakan schema Drizzle, migration versioned, `packages/database/src/migrate.ts`, dan script root `pnpm db:migrate` yang menjalankan migrator Drizzle melalui Bun. Definisikan `pnpm db:generate` untuk menghasilkan migration dari schema; review SQL sebelum diterapkan. Runner migration wajib tersedia sebelum tabel pertama dipakai.
- Verifikasi DDL aktual jika database lama tersedia. Jika belum tersedia, catat sebagai rancangan baru: putuskan tipe, nullable, precision, ID, index dan constraint secara eksplisit berdasarkan model, tanpa mengklaim sesuai database lama. Periksa duplikasi/orphan sebelum menetapkan unique/FK pada data lama.
- Migration dijalankan eksplisit setelah database siap dan tidak menjadi efek samping build/start. Migration dan test berbasis state database tidak di-cache Turbo. Schema bertambah pada phase pemilik fiturnya, bukan melalui tabel untuk alur bisnis tambahan.
- Target root script: `dev`, `start`, `build`, `typecheck`, `lint`, `format`, `test:unit`, `test:integration`, `test:e2e`, `db:generate`, `db:migrate`, `db:seed`. Script hanya dinyatakan dapat digunakan setelah didefinisikan dan diverifikasi.

## Peta phase dan dependensi

Nomor menunjukkan urutan aman. Phase tanpa hubungan dependensi dapat dikerjakan terpisah setelah prasyaratnya selesai; daftar dependensi bersifat langsung dan mewarisi prasyarat phase sebelumnya.

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

P03 dapat selesai tanpa P04 dan sebaliknya; keduanya memakai pemeriksaan hak program dari P02. P12 tidak membutuhkan konfirmasi, PDF atau ekspor. P11 menyatukan keluaran ekspor lintas fitur; CRUD/list pada phase sebelumnya sudah dapat digunakan tanpa ekspor. P09 menyelesaikan penyimpanan konfirmasi dengan status hasil yang jelas; pembuatan PDF dan redirect final baru diaktifkan pada P10 sehingga tidak bergantung ke depan.

## P00 — Fondasi monolit dan database lokal

Hasil: workspace native dapat dibangun, server menyajikan web, dan koneksi MySQL serta runner database tersedia. Ini phase prasyarat teknis bagi seluruh fitur.

| Kode task | Task dan keluaran |
| --- | --- |
| P00-T01 | Definisikan pnpm workspace, Turbo, TypeScript strict, Biome, dependency React/Vite/Mantine, Hono RPC/Zod, Drizzle/MySQL dan Bun; buat struktur tiga layer dan kontrak tanpa impor server ke browser. |
| P00-T02 | Buat entry server, route dasar, web shell, proxy `/api` development, build aset dan penyajian monolit; fallback SPA tidak menelan error API atau aset hilang. Definisikan script native yang relevan. |
| P00-T03 | Buat Compose untuk MySQL saja, environment placeholder, koneksi database, `migrate.ts`, `seed.ts` dan script `db:generate`, `db:migrate`, `db:seed`; dokumentasikan pemisahan database development/test dan lifecycle lokal. |
| P00-T04 | Siapkan konfigurasi Vitest/Playwright, fixture sintetis, kontrol waktu/timezone dan adapter test storage/WhatsApp/PDF; jalur aktivasi adapter produksi tetap eksplisit. Jangan menjalankan test pada task ini. |
| P00-T05 | Verifikasi akhir phase: lint, typecheck, build, smoke unit/integration dan E2E shell; periksa serving aset/API, aplikasi native serta koneksi database test. Verifikasi wiring runner migration/seed, hapus script test sementara dan laporkan hasil. |

## P01 — Data referensi dan bootstrap

Hasil: kamus data dapat dibaca melalui API, serta akun sintetis menyediakan prasyarat login tanpa membutuhkan UI perusahaan/admin yang belum dibuat.

| Kode task | Task dan keluaran |
| --- | --- |
| P01-T01 | Tetapkan schema dan migration `constant`, `country`, `entity_type`, `program`, `admin_user`, `role`, `user`, `user_bunga_kredit`, `user_biaya`, serta bentuk akun minimum `debitor` sesuai model. Dokumentasikan keputusan ID program/role/entity_type dan tipe debitor; tabel diperluas phase pemilik fitur. |
| P01-T02 | Tambahkan dataset referensi dan dua perusahaan sintetis, admin dengan variasi hak, HRD serta debitor melalui `seed.ts`; bootstrap kredensial lokal melalui environment dan simpan hash. Jangan membuat alur registrasi admin baru. |
| P01-T03 | Implementasikan kontrak dan repository/use case referensi serta route programs, entity-types, countries, constants dan slugs. Pisahkan slugs publik dari referensi yang membutuhkan JWT; pasang proteksi referensi saat identitas tersedia di P02, tanpa membuka route privat sementara. Catat keputusan SUPPORT-11 dan DTO. |
| P01-T04 | Verifikasi akhir phase: migrate/seed pada MySQL disposable, eksekusi ulang seed, test unit mapping dan integration referensi melalui app test dengan identity fixture; pastikan referensi privat menolak request publik. Jalankan pemeriksaan statis/build, cleanup dan catat hasil. |

## P02 — Autentikasi dan navigasi

Hasil: tiga aktor dapat login dan membuka shell sesuai akses; API mengenali aktor, tenant dan hak program tanpa memerlukan fitur CRUD admin.

| Kode task | Task dan keluaran |
| --- | --- |
| P02-T01 | Implementasikan login admin/company/debitor, username/email sesuai kontrak, slug, bcrypt dan JWT HS256 24 jam dengan id/slug/type. Catat keputusan status akun/perusahaan dan error sesuai SUPPORT-02/03. |
| P02-T02 | Bangun identity context, pembatasan tenant/ownership dan READ/WRITE program; hubungkan proteksi referensi P01. Tolak manipulasi scope/audit dari body dan jangan percaya ACL client. Dokumentasikan SUPPORT-01/08/09/14 dan FE-05/17. |
| P02-T03 | Buat halaman login, state sesi, gateway RPC, navigasi per aktor/program, breadcrumb, loading, notifikasi dan halaman tidak ditemukan. Menu fitur tampil saat route fitur tersedia; belum ada link ke layar yang belum dibuat. |
| P02-T04 | Verifikasi akhir phase: unit auth/permission, integration login dan akses API lintas dua tenant, E2E login ketiga aktor, token salah/kedaluwarsa dan akses path langsung. Jalankan lint/typecheck/build, cleanup dan laporkan hasil. |

## P03 — Admin User

Hasil: administrator dengan hak yang sesuai dapat mengelola akun dan role per program melalui UI/API.

| Kode task | Task dan keluaran |
| --- | --- |
| P03-T01 | Implementasikan DTO, repository dan use case daftar/detail/create/update/delete admin; hash password, status aktif, penggantian daftar role dan audit server; putuskan guard self-delete/last-admin secara tercatat (SUPPORT-16). |
| P03-T02 | Pasang route admin-user(s) dan pemeriksaan USA_READ/WRITE; transaksi parent/role dan validasi konflik akun. Hubungkan tabel/form tambah/lihat/ubah/hapus, filter email/username/aktif dan pagination. |
| P03-T03 | Verifikasi akhir phase: unit role/mapping, integration CRUD dan hak API, E2E form/filter/status/role; uji penolakan akses dan kegagalan simpan. Jalankan lint/typecheck/build, cleanup dan catat hasil. |

## P04 — Perusahaan, bunga dan biaya

Hasil: konfigurasi perusahaan dapat dikelola dan dipakai fitur berikutnya; CSV diselesaikan P11.

| Kode task | Task dan keluaran |
| --- | --- |
| P04-T01 | Implementasikan kontrak/repository/use case perusahaan, bunga per tenor dan biaya; transaksi parent/child, konflik identitas, rekonsiliasi array serta ownership child. Putuskan perilaku array kosong dan constraint berdasarkan bukti (SUPPORT-05/06/07, FE-14). |
| P04-T02 | Pasang API users/user dan bunga-kredits, scope serta USC_READ/WRITE; larang hapus perusahaan yang memiliki debitor. Implementasikan list/detail/form, status, slug, filter dan pagination. |
| P04-T03 | Verifikasi akhir phase: unit konfigurasi dan mapping, integration CRUD/konflik/transaksi/deletion guard dengan seeded debitor, E2E form bunga/biaya termasuk array kosong dan akses tenant. Jalankan lint/typecheck/build, cleanup dan laporkan hasil. |

## P05 — Registrasi dan Master Karyawan

Hasil: nasabah mendaftar melalui slug, login setelah registrasi dan melengkapi identitas/penghasilan/dokumen; HRD mengelola karyawan perusahaannya.

| Kode task | Task dan keluaran |
| --- | --- |
| P05-T01 | Lengkapi schema/migration `debitor` serta `debitor_data`, `debitor_family`, `debitor_financial`, `debitor_gps`, `debitor_others`, `debitor_slik`; catat tipe NUMBER/telepon, koordinat, nominal dan relasi 1:1. Data tambahan tidak menjadi form wajib baru. |
| P05-T02 | Implementasikan registrasi publik melalui slug, HRD create, detail/update/delete dan daftar debitor; kontrak payload publik berbeda dari field kelolaan internal. Terapkan transaksi, scope aktor, audit dan guard kredit yang diaktifkan bersama tabel credit P06; jangan menampilkan aksi hapus tanpa guard saat kredit tersedia. |
| P05-T03 | Implementasikan profil, penghasilan dan lima dokumen wajib serta NPWP opsional, adapter upload dan penyimpanan URL; perbaiki mapping slip gaji/tanda tangan. Buat form registrasi/profil dan tabel Master Karyawan, filter nama/alias, sort, pagination dan validasi sukses sebelum lanjut. Catat FLOW-12, SUPPORT-13, FE-02/09/10/16. |
| P05-T04 | Verifikasi akhir phase: unit validasi/mapping, integration registrasi/profil/upload dan scope dua tenant, E2E registrasi-login-profil-dokumen serta HRD CRUD. Uji file gagal dan larangan akses langsung; deletion guard kredit diverifikasi P06 setelah tabel tersedia. Jalankan lint/typecheck/build, cleanup dan catat hasil. |

## P06 — Pengajuan kredit dan simulasi

Hasil: pengajuan dan simulasi nasabah/HRD dapat dipakai dengan status HRD awal pending, tanpa membutuhkan review BPR.

| Kode task | Task dan keluaran |
| --- | --- |
| P06-T01 | Buat schema/migration `credit`, `credit_collection`, `credit_guarantor`, `credit_insurance`, `credit_potongan`, `credit_slik_bmpk`, `credit_spouse`; tetapkan mapping child/upsert dan aktifkan guard penghapusan debitor yang memiliki kredit. |
| P06-T02 | Implementasikan use case hitung angsuran flat, total angsuran, pengajuan terbuka dan score informatif; parsing nominal konsisten serta validasi tenor tersedia/zero dan batas Rp8.000.000. Catat FLOW-08/14, SUPPORT-10, FE-01/11 tanpa mengubah formula. |
| P06-T03 | Implementasikan create/detail/list/update pengajuan sesuai aktor, DTO turunan, filter/pagination dan lock edit; tolak field approval/biaya dari pengaju. Buat form, simulasi dan tabel bunga, detail dan list Pengajuan Kredit. Pasang izin CGP dan pemetaan tanggal/acknowledgment yang benar. |
| P06-T04 | Verifikasi akhir phase: unit contoh numerik independen termasuk Rp12 juta/12 bulan/1%, batas tenor dan pembagi nol; integration create/update/child/ownership/guard debitor; E2E pengajuan pending dan edit dengan filter. Jalankan lint/typecheck/build, cleanup dan laporkan hasil. |

## P07 — Persetujuan HRD

Hasil: HRD meninjau dan menyetujui/menolak pengajuan perusahaan sendiri; keputusan tersimpan tanpa bergantung layar BPR.

| Kode task | Task dan keluaran |
| --- | --- |
| P07-T01 | Tambahkan use case approve/reject HRD pada kontrak update kredit; izin field/peran, scope perusahaan, lock approved/rejected dan audit server. Catat transisi yang ambigu pada FLOW-01/02/03 sebelum memutuskan perilaku. |
| P07-T02 | Hubungkan detail pengajuan dan aksi konfirmasi HRD, state sukses/gagal serta refresh daftar; pertahankan penguncian UI dan backend sesuai keputusan terdokumentasi. |
| P07-T03 | Verifikasi akhir phase: unit status, integration approve/reject dan request langsung oleh aktor lain, E2E HRD menyetujui/menolak serta mencegah perubahan setelah terkunci. Jalankan lint/typecheck/build, cleanup dan laporkan hasil. |

## P08 — Review BPR dan notifikasi

Hasil: BPR meninjau kredit yang disetujui HRD, menetapkan status, menghasilkan snapshot biaya dan notifikasi melalui adapter.

| Kode task | Task dan keluaran |
| --- | --- |
| P08-T01 | Buat schema/migration `credit_expense`, DTO review dan repository transaksi; implementasikan biaya persen/x/langsung dari data tersimpan yang lengkap. Pertahankan asuransi, materai dan tabungan sesuai rumus; catat FLOW-04/05/09 dan FE-06. |
| P08-T02 | Implementasikan approved/rejected/completed BPR, perubahan HRD ke rejected saat penolakan BPR, lock form serta snapshot approval; jangan mensyaratkan approved sebelumnya untuk completed tanpa keputusan bisnis. Tetapkan perilaku request berulang dan kegagalan notifikasi secara tercatat. |
| P08-T03 | Buat adapter WhatsApp untuk tautan status nasabah dan implementasi produksi berdasarkan konfigurasi/provider terverifikasi; gunakan adapter deterministik untuk test. Buat Daftar Kredit Karyawan, default HRD approved, filter perusahaan/debitor/status, detail identitas/score, form nominal/tenor/asuransi/status dengan DKN_READ/WRITE. |
| P08-T04 | Verifikasi akhir phase: unit biaya/score/status, integration transaksi snapshot, pengulangan request dan gagal notifikasi, E2E approved/rejected/completed dan lock form. Uji kebocoran tenant dan field approval melalui API; lint/typecheck/build, cleanup dan laporan hasil. |

## P09 — Status nasabah, pembatalan dan rekening

Hasil: nasabah dapat melihat status, membatalkan atau menyimpan rekening/persetujuan sesudah dua approval. Pembuatan dokumen disambungkan P10.

| Kode task | Task dan keluaran |
| --- | --- |
| P09-T01 | Implementasikan use case status dan pembatalan: BPR menjadi rejected, HRD tidak diubah, acknowledgment memakai waktu server. Dokumentasikan konsekuensi agregat pengajuan terbuka/dashboard (FLOW-07/13). |
| P09-T02 | Implementasikan simpan empat field rekening, checkbox kebenaran data dan konfirmasi nama persis sama; validasi ownership dan kedua approval di backend. Petakan tambahan payload eksplisit dalam api-contract, jangan bergantung validasi client saja (FLOW-06, FE-03). |
| P09-T03 | Buat halaman status, aksi batal/lanjut, rincian biaya dan form rekening; simpan sukses sebelum melanjutkan, tangani gagal simpan dan submit berulang. Sediakan hasil konfirmasi tersimpan tanpa mengklaim PDF sudah terbentuk. |
| P09-T04 | Verifikasi akhir phase: unit nama/biaya/status, integration precondition dan waktu server, E2E pembatalan dan rekening berhasil/gagal termasuk request lintas tenant. Jalankan lint/typecheck/build, cleanup dan catat hasil. |

## P10 — Perjanjian, PDF dan halaman terima kasih

Hasil: sesudah rekening tersimpan, dokumen dibentuk, URL disimpan dan halaman terima kasih/unduhan tersedia.

| Kode task | Task dan keluaran |
| --- | --- |
| P10-T01 | Tetapkan kontrak render/count, penomoran global berdasarkan bulan created_at, format nomor, tanggal acknowledgment/angsuran pertama/akhir tenor dan terbilang. Putuskan penanganan konkurensi/render ulang, label bunga/denda dan string null dalam logic-holes sebelum perubahan kompatibilitas (FLOW-10, FE-07/08). Jika keputusan membutuhkan kolom/tabel, sertakan migration Drizzle pada task ini. |
| P10-T02 | Buat template perjanjian delapan pasal/surat persetujuan A4, adapter PDF dan storage, route render/count dengan scope akses dan penyimpanan doc_url. Kelola browser/resource, sumber URL dan kegagalan upload secara eksplisit (FLOW-11, SUPPORT-12). |
| P10-T03 | Hubungkan simpan rekening sukses ke pembuatan PDF, halaman dokumen, unduh individual dan terima kasih; gunakan kondisi acknowledgment+BPR approved+doc_url, tunggu fetch selesai sebelum redirect. Tangani kegagalan render tanpa keberhasilan palsu (FE-04/15). |
| P10-T04 | Verifikasi akhir phase: unit nomor/tanggal/biaya, integration renderer PDF nyata terpisah dari adapter deterministik, E2E perjalanan registrasi hingga unduh dokumen. Uji akses/count/render ulang/konkurensi dan kegagalan PDF/storage; lint/typecheck/build, cleanup dan laporan hasil. |

## P11 — Ekspor CSV dan ZIP

Hasil: ekspor perusahaan, debitor, kredit dan dokumen mengikuti filter, sort dan lingkup aktor pada layar sumber yang sudah tersedia.

| Kode task | Task dan keluaran |
| --- | --- |
| P11-T01 | Implementasikan endpoint export perusahaan/debitor/kredit dan format kredit-karyawan; CSV mengikuti filter/sort tanpa pagination, memuat field kontrak serta nominal/status/rekening/tanggal yang sesuai. Hubungkan tombol unduh ke list terkait. |
| P11-T02 | Implementasikan ZIP dokumen dengan filter tanggal/debitor/perusahaan sesuai aktor, hanya doc_url tersedia, maksimal lima pengambilan paralel, penamaan file dan response URL/nama. Tangani dokumen kosong serta kegagalan fetch/storage dengan pembatasan akses sumber yang tercatat. |
| P11-T03 | Verifikasi akhir phase: unit format/filter, integration isi CSV/ZIP dan scope aktor, E2E unduhan sesuai filter termasuk kosong/gagal dan tanpa bocor tenant. Jalankan lint/typecheck/build, cleanup dan laporkan hasil. |

## P12 — Dashboard aktor

Hasil: admin, HRD dan debitor melihat ringkasan sesuai kontrak, dengan navigasi yang sudah tersedia pada phase dependensinya.

| Kode task | Task dan keluaran |
| --- | --- |
| P12-T01 | Implementasikan agregasi totalUsers active/inactive tanpa blocked, totalDebitor sesuai aktor (nol bagi debitor), totalCredits berupa nominal per status HRD pending/approved/completed. Catat totalUsers global dan dampak cancellation sesuai SUPPORT-04/15, bukan mengubah agregat menjadi saldo cicilan. |
| P12-T02 | Pasang GET dashboard/data dan UI ringkasan sesuai aktor, state kosong/loading/gagal dan nominal/tanggal konsisten; gunakan query sesuai scope backend. |
| P12-T03 | Verifikasi akhir phase: unit agregasi, integration dua tenant/seluruh aktor dan status, E2E dashboard. Jalankan regresi lint/typecheck/build, unit/integration dan E2E seluruh fitur yang telah selesai; jika P09–P11 belum dikerjakan, regresinya dilakukan pada task terakhir phase tersebut ketika selesai. Hapus script test sementara dan catat hasil aktual. |

## Syarat selesai setiap phase

- Semua task implementasi phase sudah selesai; API dan UI dapat digunakan dengan prasyarat yang telah selesai atau seed sintetis yang didokumentasikan.
- Task terakhir menjalankan verifikasi yang relevan dari testing.md, termasuk API langsung untuk izin/tenant dan kegagalan operasi; test baru tidak cukup hanya memeriksa tampilan sukses. Phase fondasi/referensi boleh memakai harness sebelum login UI tersedia.
- Setiap perubahan schema disertai migration melalui `migrate.ts`; kebutuhan data disertai pembaruan `seed.ts`. Keduanya dijalankan melalui script pnpm pada environment yang tepat dan hasil aktual dicatat di task akhir phase.
- Keputusan kontrak, model, logic hole dan dampak kompatibilitas diperbarui; kebutuhan yang belum diputuskan tetap ditandai terbuka. Alur ledger, pencairan otomatis, payroll, SLIK, OTP, e-KYC dan tanda tangan tersertifikasi tidak ditambahkan.
- Semua task memiliki commit terfokus pada custom branch. Hasil test dicatat pada task verifikasi; task implementasi tidak diklaim sudah lulus test sebelum phase diverifikasi. Script test sementara sudah dihapus, rahasia dan data produksi tidak masuk commit.

Format catatan pelaksanaan yang dapat ditambahkan per task:

| Kode task | Status | Branch / hash commit | Keluaran / keputusan | Hasil verifikasi akhir phase |
| --- | --- | --- | --- | --- |
| P00-T04 | done | lihat commit Task: P00-T04 | Konfigurasi test dan adapter sintetis; belum diuji | menunggu P00-T05 |
| P00-T03 | done | lihat commit Task: P00-T03 | MySQL dan runner; belum diuji | menunggu P00-T05 |
| P00-T02 | done | lihat commit Task: P00-T02 | Shell monolit; belum diuji | menunggu P00-T05 |
| P00-T01 | done | lihat commit Task: P00-T01 | Workspace dan dependensi dasar; belum diuji | menunggu P00-T05 |

Keseluruhan rencana selesai setelah semua phase lulus task verifikasi terakhirnya, termasuk regresi lintas fitur pada phase yang dikerjakan paling akhir.
