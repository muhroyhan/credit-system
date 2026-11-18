# Register risiko pasca-MVP

Audit 18 November 2026 terhadap revisi `3695bf6`. P00–P13 telah selesai.
Prioritas mempertimbangkan dampak terhadap nilai kredit, kerahasiaan data,
kelangsungan operasi, luas dampak dan prasyarat kejadian. Urutan di setiap
bagian menunjukkan urutan penanganan. ID baru dipakai untuk tindak lanjut,
sementara ID audit MVP dipertahankan untuk penelusuran historis.

**Runtime** berarti perilaku teramati pada MySQL lokal dengan data sintetis.
**Statis** berarti jalur kode, konfigurasi atau skema mendukung temuan.
**Keputusan** berarti pemilik produk atau operasional perlu menetapkan
kebijakan sebelum perilaku diubah.

## Critical

Belum ada temuan Critical yang terverifikasi dalam cakupan audit ini.

## High

| ID | Kategori dan bukti | Dampak dan tindak lanjut |
| --- | --- | --- |
| **BL-01** | **Business logic · Runtime.** Saat BPR mengubah status `approved` menjadi `completed`, layanan menjalankan simulasi lagi dan menyimpan ulang bunga serta angsuran. Uji sintetis menaikkan tarif dari 1% ke 2% dan mengamati angsuran berubah dari Rp1.120.000 ke Rp1.240.000 dengan snapshot biaya yang sama. [Layanan review](../apps/server/src/features/credit-review/credit-review.service.ts#L184), [repository](../apps/server/src/features/credit-review/credit-review.repository.ts#L41), [tes snapshot](../tests/integration/credit-review-transitions.test.ts#L31) | Nilai kredit yang sudah disetujui dapat berbeda dari keputusan awal atau PDF yang sudah terbit. Gunakan nilai persetujuan yang tersimpan ketika menyelesaikan kredit. Uji perubahan dan penghapusan tarif setelah persetujuan. |
| **BL-02** | **Business logic · Runtime, keputusan.** BPR dapat menyelesaikan kredit sebelum nasabah mengonfirmasi atau PDF tersedia. Uji sintetis mengamati permintaan konfirmasi dan render ditolak setelah `completed`. UI juga menawarkan `completed` sebelum persetujuan BPR dan service menerima transisi itu secara statis. [Review BPR](../apps/server/src/features/credit-review/credit-review.service.ts#L156), [opsi UI](../apps/web/src/features/credit-review/CreditorReviewEditPage.tsx#L138), [konfirmasi](../apps/server/src/features/credit/credit.service.ts#L104), [prasyarat dokumen](../apps/server/src/features/agreement/agreement.service.ts#L31) | Nasabah dapat kehilangan jalur konfirmasi dan pembuatan perjanjian. Tetapkan arti `completed`, prasyaratnya, cara pemulihan kasus lama, dan akses dokumen setelah penyelesaian. |
| **BL-03** | **Business logic · Runtime, keputusan.** Persetujuan menyimpan biaya tanpa memeriksa hasil pencairan. Pada fixture, BPR menyetujui pokok Rp100.000 dengan total diterima −Rp11.000 setelah biaya administrasi, materai Rp10.000 dan tabungan tetap Rp100.000. [Review dan perhitungan biaya](../apps/server/src/features/credit-review/credit-review.service.ts#L205), [perjanjian](../apps/server/src/features/agreement/agreement.service.ts#L122) | Kredit dapat disetujui dengan nilai pencairan yang tidak masuk akal. Putuskan batas pokok atau nilai bersih minimum, termasuk perlakuan untuk kredit yang sudah disetujui. Pertahankan kebijakan biaya yang berlaku sampai diputuskan. |
| **SEC-01** | **Security · Statis.** Login dan registrasi publik tidak memasang pembatas percobaan di aplikasi. Login menjalankan verifikasi bcrypt di dalam transaksi SQL dan registrasi melakukan hashing sebelum pengecekan perusahaan. [Rute login](../apps/server/src/features/auth/auth.routes.ts), [layanan login](../apps/server/src/features/auth/auth.service.ts#L53), [rute registrasi](../apps/server/src/features/employees/employees.routes.ts), [layanan registrasi](../apps/server/src/features/employees/employees.service.ts#L133) | Percobaan kredensial berulang atau trafik registrasi dapat menghabiskan CPU dan kapasitas aplikasi. Verifikasi kontrol di proxy, lalu tetapkan batas percobaan per identitas dan sumber beserta pemantauan. Konfigurasi proxy produksi belum diperiksa. |
| **SEC-02** | **Security · Statis, keputusan.** `USA_CREATE` dan `USA_UPDATE` mengizinkan pengisian ACL admin. Layanan memeriksa keberadaan program, kemudian menyimpan ACL yang diminta. Batas pemberian hak berdasarkan hak pemberi atau target belum didefinisikan. [ACL rute](../apps/server/src/features/admin-users/admin-users.routes.ts#L29), [validasi layanan](../apps/server/src/features/admin-users/admin-users.service.ts#L32), [kontrak admin](../packages/contracts/src/index.ts#L41) | Delegasi CRUD admin juga mendelegasikan perubahan hak lintas fitur. Putuskan apakah hak tersebut setara dengan administrasi keamanan penuh dan uji batas delegasinya. |
| **SEC-03** | **Security · Statis, keputusan.** HRD dibatasi ke perusahaan aktif. Debitor dapat login dan mempertahankan akses saat perusahaan tidak aktif atau diblokir. Registrasi menerima slug yang ada, dan daftar slug publik mencakup semua status. [Identitas](../apps/server/src/features/auth/auth.repository.ts), [registrasi](../apps/server/src/features/employees/employees.service.ts#L133), [slug publik](../apps/server/src/features/reference/reference.repository.ts#L58) | Jika status blokir dimaksudkan untuk membatasi tenant, akses debitor dan pendaftaran tetap tersedia. Tentukan akses historis, pendaftaran, pengajuan baru dan sesi yang sudah aktif per status. Melanjutkan SUPPORT-03 dan SUPPORT-11. |
| **REL-01** | **Reliability · Statis.** Baseline belum menegakkan keunikan identitas admin, perusahaan dan debitor. Konflik admin/perusahaan dicek di aplikasi, sementara debitor memakai lock perusahaan dan current read. Login admin juga mencari username atau email dengan satu `LIMIT 1`, sedangkan cek konflik membandingkan username dan email di kolom masing-masing. [DDL](../packages/database/drizzle/0000_baseline.sql), [konflik admin](../apps/server/src/features/admin-users/admin-users.repository.ts#L97), [konflik perusahaan](../apps/server/src/features/companies/companies.repository.ts#L123), [login](../apps/server/src/features/auth/auth.repository.ts#L15) | Penulisan paralel admin/perusahaan, penulisan di luar layanan, atau benturan username–email dapat membuat login ambigu. Audit data, tetapkan namespace/collation identitas, lalu tegakkan pilihan dengan constraint dan uji konkurensi, termasuk slug. Melanjutkan SUPPORT-05. |
| **REL-02** | **Reliability · Runtime dan statis.** Render PDF memakai ulang URL dan nomor jika metadata sudah ada. Pada uji sintetis, setelah file privat disimulasikan hilang, render tetap sukses dan download mengembalikan `AgreementNotFound`. Secara statis, satu file hilang juga menggagalkan seluruh ekspor ZIP terkait. [Render dan unduh](../apps/server/src/features/agreement/agreement.service.ts#L84), [ZIP](../apps/server/src/utils/zip-documents.ts) | Metadata dapat menunjuk perjanjian yang tidak bisa diunduh. Tetapkan pemulihan dari cadangan dan rekonsiliasi metadata/blob. Jika PDF perlu dibuat ulang, pertahankan nomor dan isi perjanjian yang sudah diterbitkan. |
| **REL-03** | **Reliability · Statis, keputusan.** Admin dengan izin terkait dapat menghapus, menonaktifkan, atau mencabut hak admin terakhir yang bisa mengelola akun. Penghapusan hanya memeriksa keberadaan target. [Service admin](../apps/server/src/features/admin-users/admin-users.service.ts), [resolusi identitas](../apps/server/src/features/auth/auth.repository.ts#L81) | Akses administrasi dapat terkunci. Tentukan akun pemulihan dan batas untuk penghapusan, penonaktifan, serta pencabutan ACL. Melanjutkan SUPPORT-16. |
| **REL-10** | **Reliability · Statis, bersyarat.** Runner baseline menerima database kosong atau database dengan hash baseline yang cocok. Riwayat migrasi lama dan tabel tanpa riwayat ditolak. [Runner migrasi](../packages/database/src/migrate.ts), [baseline](../packages/database/drizzle/0000_baseline.sql) | Prioritas ini berlaku jika deployment membawa data warisan. Siapkan migrasi terpisah dengan verifikasi data dan rencana pemulihan. Rinciannya ada di keputusan kompatibilitas. |
| **PERF-01** | **Performance · Statis.** Ekspor CSV, XLSX, PDF dan ZIP mengambil semua hasil filter dan membangun berkas di memori. ZIP membaca lima file sekaligus, lalu menahan seluruh isi arsip hingga selesai. [Listing kredit](../apps/server/src/features/credit/credit.repository.ts#L212), [ekspor tabel](../apps/server/src/utils/export-file.ts), [ZIP](../apps/server/src/utils/zip-documents.ts) | Beberapa ekspor besar dapat menaikkan heap dan latensi untuk semua tenant pada proses Bun yang sama. Tetapkan anggaran baris/byte dan konkurensi. Verifikasi streaming atau job ekspor dengan volume representatif dan cakupan ACL yang sama. |

## Medium

| ID | Kategori dan bukti | Dampak dan tindak lanjut |
| --- | --- | --- |
| **BL-04** | **Business logic · Statis dan tes regresi, keputusan.** Pembatalan nasabah mengubah status BPR menjadi `rejected` dan mempertahankan status HRD `approved`. Kredit masih masuk hitungan pengajuan terbuka dan total dashboard berbasis HRD. Penyelesaian BPR juga mempertahankan status HRD. `totalUsers` global untuk semua aktor, `totalDebitor` global untuk admin, per tenant untuk HRD dan nol untuk debitor. `totalCredits` menjumlahkan nominal menurut status HRD, dalam cakupan aktor. [Pembatalan](../apps/server/src/features/credit/credit.repository.ts#L88), [dashboard](../apps/server/src/features/dashboard/dashboard.repository.ts), [tes dashboard](../tests/integration/dashboard.test.ts) | Angka dapat berbeda dari ekspektasi operasional dan saldo berjalan. Definisikan sumber status, unit total, dan cakupan visibilitas masing-masing metrik. Melanjutkan FLOW-07, SUPPORT-04 dan SUPPORT-15. |
| **BL-05** | **Business logic · Statis, keputusan.** Validasi perusahaan menerima bentuk bunga yang ditolak simulator, seperti notasi eksponen atau string berisi spasi saja. Tenor setara secara numerik bisa muncul lebih dari sekali, lalu simulator mengambil tarif cocok pertama dari query tanpa urutan eksplisit. [Kontrak perusahaan](../packages/contracts/src/index.ts#L105), [simulator](../apps/server/src/features/credit/credit.service.ts#L413), [query tarif](../apps/server/src/features/credit/credit.repository.ts#L121) | Konfigurasi yang berhasil disimpan dapat gagal dipakai atau menghasilkan pemilihan tarif ambigu. Sepakati format desimal, tenor kanonik, keunikan tarif per tenant, dan migrasi nilai lama. Memperluas QA-01. |
| **BL-06** | **Business logic · Statis, keputusan.** Satuan biaya berupa teks. Kalkulator memperlakukan satuan selain `%` dan `x` sebagai rupiah tetap. Nama yang memuat kata `tabungan` dikeluarkan dari total biaya, sementara PDF tetap mencetaknya dan mengurangi tabungan tetap. [Kontrak biaya](../packages/contracts/src/index.ts#L124), [kalkulasi](../apps/server/src/features/credit-review/credit-review.service.ts#L283), [rincian PDF](../apps/server/src/features/agreement/agreement.service.ts#L147) | Salah ketik atau nama ambigu bisa mengubah total atau membuat rincian sulit direkonsiliasi. Tetapkan satuan, kategori tabungan, dan cara menangani konfigurasi lama. |
| **BL-07** | **Business logic · Statis, keputusan.** PDF pertama mengambil nama, NIK, alamat, dan nama perusahaan saat render, sedangkan konfirmasi menyimpan tanggal dan rekening. Profil bisa berubah di antara kedua langkah. [Konfirmasi](../apps/server/src/features/credit/credit.repository.ts#L77), [query perjanjian](../apps/server/src/features/agreement/agreement.repository.ts#L56) | Identitas di PDF bisa berbeda dari data yang dikonfirmasi. Tentukan bidang yang harus diambil sebagai snapshot dan kapan snapshot dibuat. |
| **SEC-04** | **Security · Statis.** JWT HS256 berlaku 24 jam. Logout menghapus snapshot lokal dan API memvalidasi ulang akun serta ACL. Penggantian kata sandi tidak membatalkan token yang telah diterbitkan. JWT disimpan di `sessionStorage`, sehingga dapat dibaca JavaScript same-origin jika terjadi XSS. [Token](../apps/server/src/features/auth/auth.service.ts), [logout](../apps/web/src/features/auth/hooks/useSession.ts), [penyimpanan](../apps/web/src/features/auth/auth-session.ts) | Token yang sudah terekspos dapat tetap berlaku sampai kedaluwarsa atau akses akun dibatasi. Tetapkan revokasi untuk logout/perubahan kredensial beserta konsekuensi bagi sesi lintas tab dan perangkat. |
| **SEC-05** | **Security · Statis, keputusan.** Kontrak aplikasi kredit membolehkan data koleksi, penjamin, SLIK/BMPK, pasangan dan asuransi. Service memakai cakupan akun/tenant dan izin admin pada aksi, lalu menyimpan field tersebut tanpa aturan per kelompok field. Detail dan daftar memakai kolom kredit langsung dari skema. Debitor juga bisa mengubah `takehomePay` pada profilnya, yang menjadi masukan skor informasional. [Kontrak](../packages/contracts/src/credit.type.ts#L82), [write](../apps/server/src/features/credit/credit.service.ts#L316), [query detail](../apps/server/src/features/credit/credit.repository.ts#L153), [profil](../apps/server/src/features/employees/employees.service.ts#L229) | Tentukan field internal BPR dan HRD beserta izin baca/tulisnya. Putuskan sumber data pendapatan jika skor dipakai untuk keputusan. Inventarisasi DTO dan ekspor sebelum memperketat kontrak. Melanjutkan FLOW-01/02/03 dan FLOW-14. |
| **SEC-06** | **Security · Statis.** Unggahan privat memeriksa awal signature, MIME dan ekstensi, dengan batas 10 MB per file dan 64 MB per request. Unduhan memakai attachment, `nosniff` dan `private, no-store`. Validasi isi lengkap dan pemindaian file belum tersedia di alur aplikasi. Ekspor tabular juga belum memakai header cache seketat unduhan dokumen/ZIP. [Validasi unggahan](../apps/server/src/features/employees/employees.service.ts#L97), [unduhan](../apps/server/src/features/employees/employees.controller.ts#L142), [header ekspor](../apps/server/src/utils/export-file.ts#L1) | Dokumen tak tepercaya masih bisa dibuka petugas, dan ekspor berisi NIK atau rekening memerlukan penanganan cache konsisten. Evaluasi pemindaian dengan kebijakan retensi dan periksa header proxy. |
| **SEC-07** | **Security · Statis, bergantung deployment.** Auth menolak konfigurasi secret kosong saat dipanggil, tetapi menerima nilai nonkosong; contoh lingkungan memuat nilai placeholder untuk pengembangan. [Konfigurasi contoh](../.env.example), [auth](../apps/server/src/features/auth/auth.service.ts), [setup](../README.md) | Secret yang mudah ditebak akan membahayakan validasi seluruh sesi. Tolak konfigurasi placeholder atau secret yang lemah saat startup produksi, lalu verifikasi konfigurasi aktual melalui pengelola deployment. |
| **REL-04** | **Reliability · Statis dan tes regresi.** Notifikasi WhatsApp dikirim setelah commit, dari request yang sama, dengan timeout pengiriman 10 detik. Kegagalan atau konfigurasi kosong menghasilkan status respons; outbox dan retry otomatis belum ada. [Review dan notifikasi](../apps/server/src/features/credit-review/credit-review.service.ts#L223), [batas pengiriman](../apps/server/src/utils/whatsapp.ts), [tes notifikasi](../tests/integration/credit-notification.test.ts) | Crash atau kegagalan sementara dapat menghilangkan notifikasi meski persetujuan tersimpan. Tetapkan kebutuhan delivery dan status retry, termasuk pencegahan kirim ganda. Meta live belum diverifikasi. |
| **REL-05** | **Reliability · Statis.** Pembuatan pengajuan tidak memakai kunci idempotensi dan selalu melakukan insert. Pemeriksaan transisi berikutnya memakai lock transaksi. [Controller](../apps/server/src/features/credit/credit.controller.ts#L70), [repository](../apps/server/src/features/credit/credit.repository.ts#L282) | Ulang kirim setelah respons hilang dapat membuat dua pengajuan. Tentukan jangkauan idempotensi per aktor dan pertahankan dukungan pengajuan baru yang disengaja. |
| **REL-06** | **Reliability · Statis.** Health endpoint hanya mengembalikan status `ok`, koneksi DB dibuka secara lazy, dan handler shutdown menutup pool lalu keluar tanpa tahap drain aplikasi yang eksplisit. [Health](../apps/server/src/features/health/health.controller.ts), [pool](../packages/database/src/client.ts), [shutdown](../apps/server/src/utils/shutdown.ts) | Probe dapat terlihat sehat ketika fungsi berbasis DB belum siap. Request aktif saat deploy berisiko terputus. Verifikasi liveness/readiness dan perilaku shutdown pada infrastruktur yang dituju. |
| **REL-07** | **Reliability · Statis.** Unggah profil dan pembuatan PDF melibatkan disk dan SQL, dengan kompensasi penghapusan file baru jika transaksi gagal. Gagal cleanup atau crash dapat menyisakan orphan. Penyimpanan bawaan menggunakan path lokal relatif. [Unggah](../apps/server/src/features/employees/employees.service.ts#L233), [render](../apps/server/src/features/agreement/agreement.service.ts#L80), [adapter disk](../apps/server/src/utils/document-storage.ts) | Perlu kebijakan backup terkoordinasi, pemulihan saat deploy, dan rekonsiliasi. Periksa persistensi volume sebelum memakai beberapa instance. |
| **PERF-02** | **Performance · Statis dan runtime SQL.** Listing kredit admin menjalankan hingga tiga query tambahan per baris untuk simulasi, termasuk tarif yang tidak dipakai untuk skor. Agregat kredit terbuka pada daftar karyawan memakai subquery berkorelasi. Baseline belum memiliki indeks `credit.debitor_id`; `EXPLAIN` untuk filter debitor/status pada DB audit menunjukkan `type=ALL`. [Listing admin](../apps/server/src/features/credit/credit.service.ts#L250), [query simulasi](../apps/server/src/features/credit/credit.repository.ts#L121), [agregat karyawan](../apps/server/src/features/employees/employees.repository.ts#L72), [DDL](../packages/database/drizzle/0000_baseline.sql) | Latensi dan kontensi pool berpotensi naik seiring volume. Uji agregasi batch, indeks join/filter yang sesuai, dan pencarian yang kompatibel dengan wildcard, kolasi dan ID parsial saat ini. |
| **PERF-03** | **Performance · Statis.** Upload memuat multipart dan byte file ke memori sebelum validasi per file. SQL lock tetap terbuka saat penulisan dokumen atau render PDF. Lock counter bulanan dapat bertahan hingga PDF tersimpan ketika nomor baru dialokasikan. [Upload controller](../apps/server/src/features/employees/employees.controller.ts#L87), [transaksi upload](../apps/server/src/features/employees/employees.service.ts#L233), [render](../apps/server/src/features/agreement/agreement.service.ts#L84), [counter](../apps/server/src/features/agreement/agreement.repository.ts#L89) | Upload besar atau disk lambat berpotensi menahan memori, koneksi, dan operasi satu tenant atau satu bulan. Ukur waktu lock dan peak memory, lalu evaluasi staging file dengan mekanisme pemulihan. |
| **PERF-04** | **Performance · Runtime build.** Build Vite menghasilkan satu chunk JavaScript awal `index-Wrbrvq7W.js` berukuran 805,26 kB, 248,82 kB gzip menurut laporan build. Pada smoke test Bun loopback, aset dikirim sebagai 805.263 byte tanpa `Content-Encoding` ketika klien meminta gzip. Router mengimpor halaman fitur secara eager. [Router](../apps/web/src/router.tsx) | Login dan kunjungan awal membawa kode lintas fitur. Ukur waktu muat pada perangkat target dan pertimbangkan lazy loading per rute. Kompresi pada reverse proxy produksi belum diperiksa. |

## Low

| ID | Kategori dan bukti | Dampak dan tindak lanjut |
| --- | --- | --- |
| **BL-08** | **Business logic · Keputusan.** Simulasi memakai bunga flat bulanan, tenor positif yang dikonfigurasi, serta batas 12 bulan di bawah Rp8 juta. Skor informasional membandingkan gaji bulanan dengan total pokok. [Simulasi dan skor](../apps/server/src/features/credit/credit.service.ts#L413) | Validasi label maupun interpretasi skor bersama pemilik produk sebelum mengubah formula. Melanjutkan FLOW-08, SUPPORT-10, FE-01 dan FE-11. |
| **REL-08** | **Reliability · Statis.** Tanggal konfirmasi memakai `CURRENT_DATE` MySQL. Bulan penomoran memakai `DATE_FORMAT` MySQL, sementara filter tanggal dan sebagian label memakai zona proses Bun. MySQL disposable audit melaporkan zona sistem UTC. [Tanggal konfirmasi](../apps/server/src/features/credit/credit.repository.ts#L76), [bulan perjanjian](../apps/server/src/features/agreement/agreement.repository.ts#L60), [filter tanggal](../apps/server/src/features/credit/credit.repository.ts#L242) | Verifikasi zona bisnis dan batas tengah malam/akhir bulan pada deployment. Pertahankan input tanggal kalender tanpa offset tetap. |
| **REL-09** | **Reliability · Statis.** Gateway web saat audit memiliki 35 assertion `as never`. Web menarik tipe Bun melalui graph `AppType`; `skipLibCheck` masih aktif. Validasi respons DTO bervariasi. [Contoh RPC](../apps/web/src/features/credit/credit.api.ts), [tsconfig web](../apps/web/tsconfig.json), [tsconfig root](../tsconfig.json) | Hono RPC belum memeriksa semua bentuk input pada waktu kompilasi. Pertimbangkan validator bertipe, tipe RPC yang terisolasi, dan konsolidasi kontrak/paginasi yang menjaga perbedaan aturan kata sandi dan scope. Hutang JSDoc dan gaya deklarasi tetap tercatat pada audit sebelumnya. |

## Keputusan kompatibilitas

- **Data lama dan deployment (REL-10).** Migrasi terpisah perlu mengaudit
  konversi ACL `WRITE`, `created_at` yang pernah dapat tertimpa
  pada migrasi 0005 sebelum perbaikan 0006, URL profil lama ke key privat,
  `DECIMAL(30,2)` snapshot biaya, serta data orphan/duplikat sebelum menambah
  foreign key atau constraint. Periksa pemetaan telepon/`NUMBER`, koordinat
  unsigned, presisi nominal, nullability dan kardinalitas child.
  [Runner migrasi](../packages/database/src/migrate.ts), [baseline](../packages/database/drizzle/0000_baseline.sql)
- **Perjanjian · Keputusan.** Nomor unik dialokasikan dengan counter per bulan
  pembuatan kredit dan disimpan dengan nama perusahaan yang dinormalisasi.
  Alokasi berjalan di bawah lock; tes memeriksa konkurensi dan nomor yang
  dipertahankan saat retry. Template delapan pasal, identitas bank, istilah
  bunga/biaya, dan denda awal 0,2% per hari perlu konfirmasi otoritatif.
  Melanjutkan FLOW-10, FE-07 dan FE-08.
  [Nomor dan PDF](../apps/server/src/features/agreement/agreement.service.ts),
  [tes konkurensi](../tests/integration/agreement.test.ts)
- **HRD · Keputusan.** Hanya HRD tenant pemilik dapat memutuskan
  `pending → approved/rejected`. Status historis `completed` dan `null`
  belum punya transisi HRD. Persetujuan dan penolakan mengunci edit aplikasi
  biasa. [Layanan kredit](../apps/server/src/features/credit/credit.service.ts),
  [matriks persetujuan](../tests/integration/credit-approval-matrix.test.ts)
- **Listing · Kompatibilitas API.** `search` memakai OR antar kolom dan
  digabungkan dengan filter per kolom. List, count dan ekspor memakai scope
  serta filter yang konsisten. Pencarian mengikuti wildcard dan kolasi
  MySQL, termasuk ID parsial kredit melalui `search`. Filter ID persis dan
  sort key lama tetap tersedia.
  [Query kredit](../apps/server/src/features/credit/credit.repository.ts),
  [tes listing](../tests/e2e/listing-search.spec.ts)

## Penelusuran ID MVP

ID historis berikut adalah petunjuk investigasi. Perilaku saat ini tercatat
pada temuan yang dirujuk dan pada tes untuk skenario yang dicakup.

| ID historis | Hasil crosscheck |
| --- | --- |
| QA-01, SUPPORT-05 | Format tarif dan konflik identitas dilacak di BL-05 dan REL-01. |
| SUPPORT-03/11/16, FLOW-07, SUPPORT-04/15 | Status tenant, admin terakhir dan semantik agregat tetap terbuka di SEC-03, REL-03 dan BL-04. |
| FLOW-01/02/03/14, SUPPORT-01/02/08/09/14, FE-05 | Auth dan ACL diterapkan pada jalur yang diuji. Batas delegasi dan aturan per field dilacak di SEC-02 dan SEC-05. [Tes HTTP auth](../tests/integration/http/auth.spec.ts), [tes scope kredit](../tests/integration/credit-scope.test.ts) |
| FLOW-04/05/09, FE-06 | Persetujuan BPR menyimpan snapshot biaya secara atomik dan menolak pengulangan. Repricing pada penyelesaian dan pencairan negatif masih terbuka di BL-01 dan BL-03. [Tes review](../tests/integration/credit-review.test.ts) |
| FLOW-06, FE-03/04/15, FLOW-10, FE-07/08 | Nama persis, dua persetujuan dan rekening diperlukan dalam jalur konfirmasi/perjanjian. Penyelesaian dini, snapshot identitas dan pemulihan file dilacak di BL-02, BL-07 dan REL-02. [Tes nasabah](../tests/integration/credit-customer-matrix.test.ts), [tes perjanjian](../tests/integration/agreement-preconditions.test.ts) |
| FLOW-11/12/13, SUPPORT-12/13 | Cakupan ekspor, dokumen privat, actor audit dan rollback memiliki tes. Risiko penyimpanan, cache dan volume dilacak di SEC-06, REL-07 serta PERF-01/03. [Ekspor E2E](../tests/e2e/export.spec.ts), [tes dokumen](../tests/integration/document-storage.test.ts), [tes timestamp](../tests/integration/audit-timestamps.test.ts) |
| FLOW-08, FE-01, SUPPORT-10, FE-11 | Formula, skor, format pokok dan batas tenor dipertahankan pada BL-08. [Tes kredit](../tests/unit/credit.test.ts) |
| FE-02/09/10/16 | Kontrak profil memakai validasi field, key file terpisah, regex password tanpa flag global dan nilai tanggal kalender. Risiko zona tanggal operasional dilacak di REL-08. [Kontrak karyawan](../packages/contracts/src/employees.type.ts), [tes profil](../tests/integration/employees-boundaries.test.ts) |
| FE-12/13/17 | Lock edit dan field acknowledgment digunakan oleh alur saat ini; tes memeriksa peran HRD, admin dan nasabah dalam skenario yang tersedia. [Tes peran kredit](../tests/integration/credit-scope.test.ts), [tes BPR E2E](../tests/e2e/credit-review.spec.ts) |
| SUPPORT-06/07, FE-14 | Array kosong menghapus konfigurasi. Child divalidasi milik perusahaan, account update memakai ID, dan field memakai `bungaPercentage`. [Service perusahaan](../apps/server/src/features/companies/companies.service.ts), [tes perusahaan](../tests/integration/companies.test.ts) |
| FLOW-15 | Konfigurasi JWT, DB dan Meta dimuat oleh server dari environment. Validasi konfigurasi runtime dilacak di SEC-07. [Environment contoh](../.env.example), [koneksi DB](../packages/database/src/client.ts), [notifikasi](../apps/server/src/features/credit-review/credit-review.service.ts#L236) |

## Bukti dan batas verifikasi

- REA CLI `6.8.0` dipakai karena alat MCP tidak tersedia di sesi ini.
  Analisis REA bersifat statis. Hasilnya dipadankan dengan source, kontrak Zod,
  baseline Drizzle, tes dan observasi MySQL sintetis.
- Build server penuh (`apps/server/dist/index.js`, 5.632.978 byte) terinventarisasi.
  Worker REA kehabisan heap 1.024 MiB saat analisis statis; hasilnya parsial.
  Evidence `ev_564ab440446f6e96bf6e7ac294c38fc71977b9632860e20564cd925ebab59f2a`.
- Build diagnostik dari entry point server yang sama, dengan paket eksternal
  (`bun build apps/server/src/index.ts --target=bun --packages=external`),
  menghasilkan 129.866 byte JavaScript. REA mem-parsing satu file dan
  mengidentifikasi kandidat `/export-zip` serta fungsi `saveReview` dan
  `reserveNumber`. Resolusi semantik dan dependensi eksternal tetap terbatas.
  Evidence `ev_7d46472615284d2ff2ebd4b9950b113eed0d99b9a69f3e311791ab9537680a49`.
- Build web penuh mencapai batas waktu REA 300 detik saat menganalisis
  JavaScript. Evidence parsial
  `ev_7361446a917d403cfeb27b6cf05cf02fa59e47cf612dcebbdd3de4102461b81a`.
  Analisis ulang dengan pilihan `index.html` pada build Vite yang sama berhasil
  dan menginventarisasi chunk awal. Evidence
  `ev_02cd3ed0f66bb19ceb58d4f6de55321c21c055654667a80eecf8b2582d012ad4`.
- Build diagnostik web (`bun build apps/web/src/main.tsx --target=browser
  --packages=external`) menghasilkan 179.951 byte JavaScript. REA
  mengidentifikasi fungsi `readStoredSession`, `writeStoredSession` dan
  `useCustomerCredit`. Dependency eksternal dan hubungan dinamis masih berada
  di luar cakupan pemeriksaan. Evidence
  `ev_4060bbfc1c795da93f905c7d60af93908e98769112d4f6f60005b208e5d6391f`.
- Verifikasi revisi audit lulus untuk build, lint (satu info Biome), typecheck,
  322 unit, 203 integrasi Vitest, 8 integrasi HTTP dan 29 E2E browser. E2E lulus
  setelah memakai Chromium lokal yang tersedia. Percobaan awal memakai
  headless-shell bawaan yang belum terpasang. Smoke test bundle Bun/Vite
  memberi HTTP 200 pada health, halaman login dan aset JavaScript.
- Uji fokus dengan layanan asli dan MySQL disposable mengonfirmasi BL-01,
  BL-02, BL-03, dan REL-02. Simulasi kehilangan file REL-02 memakai adapter
  in-memory dengan render PDF asli. Performa produksi, volume produksi,
  konfigurasi proxy, advisori dependensi, database warisan dan pengiriman
  WhatsApp live berada di luar cakupan verifikasi.
- P13 mencatat build, lint, typecheck, 317 unit, 203 integrasi Vitest, 7 HTTP
  dan 23 E2E lulus pada 13 November 2026. Rincian fase MVP ada di riwayat Git.
