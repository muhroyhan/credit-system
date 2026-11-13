# Risiko dan keputusan kompatibilitas

Sumber tunggal isu terbuka dan perubahan perilaku. Tabel ID berasal dari analisis sumber bisnis awal, bukan bukti bahwa implementasi sekarang masih memiliki semua celah tersebut. Fitur P06–P12 belum tersedia; evaluasi ID terkait sebelum mengimplementasikannya. Status perbaikan P00–P04 dan isu teknis terkini ada setelah tabel.

| ID | Risiko acuan yang harus diperiksa pada phase pemilik |
| --- | --- |
| FLOW-01 | Create credit menerima debitor_id, nominal, status langsung dari body; tidak ada cek kepemilikan/role/kelayakan. |
| FLOW-02 | Filter credit userId/debitorId serta debitor options.id dapat menimpa scope claim. Detail/update/delete debitor tidak konsisten membatasi actor/resource. |
| FLOW-03 | Update credit membatasi kepemilikan tetapi bukan izin per-field/peran/transisi; nasabah dapat mengirim field approval/biaya; lock UI tidak ditegakkan server. |
| FLOW-04 | Approval berulang menggandakan snapshot biaya/notifikasi; tidak ada transaksi dan rollback bila child/notifikasi gagal. |
| FLOW-05 | Nominal biaya diambil dari payload parsial, dapat NaN; cabang actor debitor salah memilih id perusahaan. |
| FLOW-06 / FE-03 | Rekening, persetujuan nama, checkbox dan syarat dua approval diperiksa UI; backend menerima update tanpa validasi yang setara. |
| FLOW-07 | P09-T01: pembatalan nasabah mengubah BPR menjadi rejected dan mencatat tanggal server; HRD tetap approved. Agregat pengajuan terbuka dan dashboard yang mengikuti HRD tetap menghitung pengajuan tersebut. |
| FLOW-08 / FE-01 | Formula flat vs label annuitas/tahunan; score membandingkan gaji bulanan dengan total pokok, bukan angsuran. Jangan mengganti diam-diam. |
| FLOW-09 / FE-06 | Total diterima memakai tabungan tetap, mengabaikan nilai snapshot tabungan dinamis; potensi ketidakselarasan biaya. |
| FLOW-10 / FE-07 | Nomor PKS berdasarkan count global bulan created_at, string 'null', dan tidak tersimpan/atomic; rawan duplikasi/perubahan saat render ulang. |
| FLOW-11 | Export PDF dan count tidak memeriksa ownership di controller; GET membuat/upload dokumen; bulk fetch URL tersimpan tanpa allowlist di controller. |
| FLOW-12 | Slip gaji mengunggah data tanda tangan; update parent/child/upload tidak transactional; delete membiarkan child historis. |
| FLOW-13 | Audit created_by/updated_by berasal request; acknowledgment truthy selalu ditimpa sekarang, termasuk cancellation. |
| FLOW-14 | Tidak ada validator backend untuk nominal/tenor/zero, enum status atau kelengkapan dokumen; perhitungan frontend dipercayai. |
| FLOW-15 | Penempatan kredensial database/cloud pada konfigurasi aplikasi berisiko membuka rahasia; gunakan konfigurasi lingkungan. |
| SUPPORT-03 | Login debitor tidak memeriksa status perusahaan; status debitor dipick tetapi tidak dipilih attrs. |
| SUPPORT-04 | Debitor mendapat totalUsers global. |
| SUPPORT-10 | Parsing nominal berformat dapat menghasilkan nilai salah; normalisasi create/update perlu konsisten tanpa mengubah rumus bisnis. |
| SUPPORT-11 | Public slugs menyertakan seluruh tenant tanpa filter active. |
| SUPPORT-12 | Render PDF dengan URL/cookie bebas tanpa cleanup browser berisiko pada akses jaringan dan pemakaian sumber daya. |
| SUPPORT-13 | Upload dokumen identitas public-read, MIME/ext dipercayai, nama random berentang kecil. |
| SUPPORT-15 | Dashboard credit adalah total nominal pengajuan per status; blocked company tidak masuk totalUsers. |
| SUPPORT-16 | Admin dapat hapus dirinya/last admin; tidak ada guard endpoint. |
| FE-02 | Tombol lanjut profil/dokumen dapat melewati validasi form; redirect yang hanya bergantung loading selesai dapat terjadi setelah gagal simpan. |
| FE-04 | Pembuatan dokumen yang bergantung pada promise tanpa memeriksa hasil aksi dapat berjalan sesudah penyimpanan gagal; perlu pengujian integrasi. |
| FE-08 | Surat memakai bunga r*12 sementara PKS memakai r/tahun; denda constant vs hardcoded 0.2%; administrasiTerbilang menguji provisiPercent, bukan administrasiPercent |
| FE-09 | Konversi base64 yang melanjutkan pembacaan file setelah hasil kosong atau URL yang sudah tersedia berpotensi menghasilkan exception. |
| FE-10 | State passwordRegex global membuat `.test` stateful; KTP minimal 16, email TLD 2–4, nominal required menerima 0; aturan UX tidak seragam |
| FE-11 | Filter tenor <8 juta fallback ke tenor 12 tanpa memverifikasi tenor 12 ada; invalid config/tenor nol bisa menghasilkan NaN/Infinity |
| FE-12 | Tombol Simpan master kredit untuk admin disabled ketika bukan view dan enabled ketika view (ternary terbalik dari non-admin); remarks admin muncul tanpa disabled di view |
| FE-13 | Pengajuan list memakai dataIndex `debitorAcknowledgementTimestamp` (dengan e) sedangkan model/transformer bernama `debitorAcknowledgmentTimestamp`; kolom berpotensi kosong |
| FE-15 | Halaman terima kasih dapat redirect ke approval ketika URL dokumen masih kosong pada state awal, sebelum pengambilan data selesai. |
| FE-16 | Date tanggalPengajuan ditambah 7 jam saat transform ke API; berpotensi offset ganda bergantung backend/persistence |
| FE-17 | Nama menu/ACL Master Karyawan dan Pengajuan Kredit berbagi CGP; Company Group dibuang dari daftar role admin namun role lain memakai abbreviation. Jangan mengganti pemetaan berdasar nama saja |

## Status dan keputusan yang sudah diambil

| ID/area | Status sekarang dan batas |
| --- | --- |
| SUPPORT-01, SUPPORT-02, SUPPORT-08, SUPPORT-09, SUPPORT-14, FE-05 | P02–P04 menerapkan revalidasi identitas/role, ACL aksi tepat, Zod query/body, audit server dan gate halaman. Belum merupakan bukti untuk fitur kredit yang belum dibuat. |
| SUPPORT-06, SUPPORT-07, FE-14 | P04: pengguna menyetujui array kosong menghapus seluruh konfigurasi. Child harus milik perusahaan, update memakai user_id; nama bungaPercentage konsisten. |
| SUPPORT-05 | Transaksi parent/child sudah diterapkan. Pemeriksaan konflik sebelum write masih dapat mengalami race antartransaksi karena belum ada constraint unik fisik. |
| FLOW-08/14, SUPPORT-10, FE-01/11 | P06 menerapkan perhitungan flat bulanan dan score informatif tanpa mengubah rumus. Nominal menerima digit atau pemisah ribuan titik; tenor harus positif, tersedia dalam konfigurasi dan maksimal 12 bulan untuk nominal di bawah Rp8 juta. Agregasi memilih kredit HRD pending/approved. Cakupan verifikasi dan hasil aktual tercatat pada testing.md. |
| FLOW-04/05/09, FE-06 | Pengguna memilih menyimpan pecahan biaya dengan decimal; P08 memakai `credit_expense.amount` DECIMAL(30,2) dan perhitungan tepat dalam satuan sen. Ini perubahan dari kamus awal integer yang memerlukan pemeriksaan kompatibilitas data lama. Materai Rp10.000 dan tabungan tetap Rp100.000 mengikuti rumus terdokumentasi. Snapshot dan status disimpan dalam satu transaksi; permintaan berulang menghasilkan konflik. Notifikasi dilakukan setelah commit: kegagalan atau konfigurasi kosong dilaporkan dalam respons, tidak membatalkan keputusan dan tidak memiliki retry otomatis atau antrean persisten. Jika proses berhenti sesudah commit sebelum mengirim, notifikasi bisa hilang. Pengiriman WhatsApp nyata belum diuji. |
| FLOW-01/02/03 | P07: hanya HRD tenant pemilik dapat memutuskan pending menjadi approved/rejected; input keputusan dibatasi id/status, scope dan audit ditentukan server. Approved/rejected terkunci termasuk permintaan berulang. Status lama lain termasuk completed/null tidak memiliki transisi HRD yang ditetapkan, sehingga ditolak; penanganan data lama memerlukan keputusan bisnis. Admin BPR dan debitor tidak mendapat kewenangan HRD. |
| SUPPORT-03, SUPPORT-11 | Tetap terbuka: status perusahaan tidak diperiksa untuk akun debitor; slug publik mencakup inactive/blocked. Memerlukan keputusan produk sebelum diperketat. |
| SUPPORT-16 | Belum melarang self-delete atau hapus admin terakhir; risiko kehilangan akses tetap memerlukan keputusan bisnis. |
| Migrasi ACL | WRITE dihapus; API dan aplikasi memakai aksi granular. Dampak data/migration dan path client hanya dirinci pada model data dan kontrak API. |

## Keputusan P10 penomoran

Pengguna menyetujui nomor tetap dan unik secara global per bulan pembuatan kredit. Alokasi memakai row counter bulanan serta lock kredit dalam transaksi; format nomor menyimpan snapshot nama perusahaan dan bulan. Render ulang memakai nomor tersimpan. Konversi bulan menggunakan tanggal MySQL kredit; data lama yang pernah terpengaruh migration 0005 tetap memerlukan verifikasi historis. Nomor tidak boleh diterbitkan sebelum dua approval, acknowledgment dan rekening lengkap. Template pasal/surat, identitas BPR, serta label bunga/denda masih menunggu sumber resmi.

## Isu teknis terbuka

- Enam belas assertion as never (empat query baru P05 memakai pola validasi controller manual) di gateway RPC menutup pemeriksaan input end-to-end. Pasang validator Hono bertipe sebelum mengklaim request type safe.
- Frontend masih membutuhkan ambient Bun melalui graph tipe AppType. Deklarasi RPC mandiri diperlukan untuk isolasi tipe browser penuh.
- skipLibCheck tetap true: probe tanpa flag ini gagal pada deklarasi dependency Bun/Node, optional driver Drizzle dan tipe DOM Hono/jsPDF. Jangan menutupnya dengan ambient stub palsu.
- JSDoc seluruh ekspor fitur dan preferensi function declaration untuk beberapa factory lokal belum lengkap. Cast komposisi schema Hono dan output jsPDF belum menjadi pembuktian tipe runtime.
- Validasi response runtime belum seragam; schema input runtime tidak dengan sendirinya membuktikan seluruh DTO keluaran valid.
- Hak UI memakai snapshot login yang dapat tertinggal; server memeriksa ulang. Ekspor tanpa batas menyimpan data/dokumen dalam memori server selama pembuatan.

## Audit duplikasi — 13 November 2026

Pemindaian blok identik/serupa pada 190 file TS/TSX terlacak (aplikasi, package, konfigurasi dan test), disertai review kandidat. Artefak generated/build/dependency bukan target refactor; kemiripan deklarasi field atau wiring fitur bukan otomatis duplikasi perilaku.

| Area | Hasil / keputusan |
| --- | --- |
| Ekspor | Header lima controller dan parameter lima API frontend dipusatkan pada utilitas ekspor/query yang ada; format file, filter, nama unduhan dan status respons dipertahankan. |
| Schema frontend | Referensi entity dan enum ACL memakai schema kontrak; proxy ekspor schema employee dihapus agar pemakai mengimpor langsung. Schema admin DTO tidak disatukan begitu saja: nullability dan optional roles berbeda. |
| Controller | Pemetaan error credit/review identik; pola validasi request berulang lintas fitur. Pengguna menyetujui helper bersama; implementasi di utils/controller.ts. Error tidak dikenal harus tetap menjadi kegagalan internal, bukan 400. |
| Hooks | Query/list/export dan penanganan delete berulang. Pengguna menyetujui dan implementasi memakai useListing; invalidasi cache dan default filter tiap fitur berbeda. |
| Test | Guard database disposable, identitas sintetis dan login browser berulang. Pengguna menyetujui helper fixture; guard DB dan login fitur dipusatkan. |
| Service/repository | Hash bcrypt di tiga fitur dan enam pola simpan child kredit berulang. Pengguna menyetujui sentralisasi; hashPassword dan saveChild telah diterapkan; transaksi service dan tipe tiap tabel harus dipertahankan. Guard ownership employee serta query permission auth juga kandidat ekstraksi lokal. |
| Kontrak/query/form | Pagination, validasi password admin/perusahaan dan bentuk list DTO serupa; belum ada factory bersama. Ekstraksi lebih luas perlu keputusan standar baru, tanpa menyamakan aturan password employee atau scope tenant yang berbeda. |

Audit ini belum menyatakan proyek bebas duplikasi: kandidat kontrak/query/form dan ekstraksi lokal yang belum disepakati tetap dicatat untuk keputusan berikutnya. Hasil pemeriksaan perubahan dicatat di testing.md.

- Migration 0005 sempat mengubah `created_at` ketika row diperbarui. Migration 0006 menghentikan perilaku itu, tetapi tidak dapat memulihkan tanggal yang sudah tertimpa; data yang melewati 0005 memerlukan verifikasi sumber historis sebelum dipakai untuk penomoran P10.

- Baseline migration tunggal berlaku untuk database kosong; histori migration terdahulu dan transformasi ACL WRITE tidak otomatis diterapkan pada database lama. Runner menolak histori yang berbeda; migrasi data lama perlu dirancang terpisah.

## Risiko pemetaan data

Pemetaan NUMBER/telepon, koordinat unsigned, precision nominal, nullable DTO, kardinalitas child serta orphan memerlukan verifikasi sebelum phase terkait. Kamus dan status DDL hanya di [data-model.md](data-model.md); nilai turunan seperti score/agregat bukan otomatis kolom persistence. Jangan mengubah rumus atau menganggap relasi konseptual sebagai FK/unique fisik.

## P05 — kompatibilitas profil dan dokumen

FLOW-12/SUPPORT-13: child profil ditulis di transaksi dengan lock debitor, slipGajiUrl dan tandaTanganUrl dipetakan terpisah. Kolom URL menyimpan key privat yang dihasilkan server; DTO memetakannya ke endpoint unduhan berotorisasi, bukan public-read. File lama berbentuk URL eksternal tidak di-fetch oleh adapter ini dan memerlukan migrasi storage tersendiri. File maksimum 10 MB dan request 64 MB adalah batas teknis upload. Signature/MIME/extension diperiksa; belum mencakup antivirus. Storage di luar transaksi SQL memakai kompensasi file baru; crash proses atau kegagalan cleanup dapat meninggalkan orphan disk untuk rekonsiliasi operasional.

FE-02/09/10/16: form memakai RHF/Zod per field, tidak mengirim URL/base64 lama sebagai file, password regex tanpa flag global, tanggal kalender tanpa tambah tujuh jam. Profil memerlukan isian menurut kebutuhan bisnis; tidak menambah aturan NIK 16 digit/email TLD lama secara diam-diam. Field model keluarga/GPS/SLIK tetap opsional dan belum menjadi form wajib.

Registrasi/HRD create mengikuti slug/scope tenant dan username unik per tenant. Lock perusahaan dan pembacaan FOR UPDATE menyerialisasi create/update akun lewat service; child profil juga memakai current read saat transaksi agar snapshot lama tidak menggandakan child; writer eksternal yang melewati service tetap membutuhkan constraint setelah audit data. Status tenant mengikuti kompatibilitas SUPPORT-03/11 yang masih terbuka. Guard delete memeriksa tabel credit bila sudah ada; test dengan kredit nyata dilakukan P06.

P10: pengguna memberikan template DOCX lama sebagai inspirasi dan mengizinkan redaksi baru. Dokumen proyek memakai delapan pasal baru tanpa menyalin identitas atau angka contoh. Bunga dilabeli flat per bulan sesuai rumus berjalan; denda dikonfigurasi dengan nilai awal 0.2%/hari dari referensi. Identitas BPR wajib dari konfigurasi. Field wajib yang kosong menolak render, tidak dicetak sebagai null. Generasi memakai POST, unduhan GET tanpa render; nomor tetap, dokumen tersimpan dipakai ulang.

P12-T01: totalUsers adalah jumlah perusahaan active/inactive global untuk semua aktor, termasuk debitor (SUPPORT-04). totalDebitor global untuk admin, tenant HRD, nol untuk debitor. totalCredits adalah jumlah nominal berdasarkan status HRD pending/approved/completed dalam scope aktor; pembatalan nasabah yang hanya mengubah BPR tetap terhitung pada approved (FLOW-07/SUPPORT-15). Nilai nominal dikirim sebagai string desimal untuk mempertahankan presisi.
