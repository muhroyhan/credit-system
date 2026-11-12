# Catatan logic hole dan keputusan terbuka

Daftar ini mencatat risiko dari analisis statis; dampak runtime, tingkat keparahan, dan solusi belum diverifikasi. Jangan mengubah business flow atau mengklaim perbaikan tanpa keputusan eksplisit. Kode rentan tidak wajib direproduksi: catat dampak kompatibilitas jika perilaku teknis perlu diperbaiki. Temuan antar-ID dapat saling beririsan.

| ID | Temuan untuk divalidasi |
| --- | --- |
| FLOW-01 | Create credit menerima debitor_id, nominal, status langsung dari body; tidak ada cek kepemilikan/role/kelayakan. |
| FLOW-02 | Filter credit userId/debitorId serta debitor options.id dapat menimpa scope claim. Detail/update/delete debitor tidak konsisten membatasi actor/resource. |
| FLOW-03 | Update credit membatasi kepemilikan tetapi bukan izin per-field/peran/transisi; nasabah dapat mengirim field approval/biaya; lock UI tidak ditegakkan server. |
| FLOW-04 | Approval berulang menggandakan snapshot biaya/notifikasi; tidak ada transaksi dan rollback bila child/notifikasi gagal. |
| FLOW-05 | Nominal biaya diambil dari payload parsial, dapat NaN; cabang actor debitor salah memilih id perusahaan. |
| FLOW-06 | Rekening, persetujuan nama, checkbox dan syarat dua approval diperiksa UI; backend menerima update tanpa validasi yang setara. |
| FLOW-07 | Pembatalan nasabah mengubah BPR saja; saldo terbuka dan dashboard bergantung status HRD sehingga bisa tidak selaras. |
| FLOW-08 | Formula flat vs label annuitas/tahunan; score membandingkan gaji bulanan dengan total pokok, bukan angsuran. Jangan mengganti diam-diam. |
| FLOW-09 | Total diterima memakai tabungan tetap, mengabaikan nilai snapshot tabungan dinamis; potensi ketidakselarasan biaya. |
| FLOW-10 | Nomor PKS berdasarkan count global bulan created_at, string 'null', dan tidak tersimpan/atomic; rawan duplikasi/perubahan saat render ulang. |
| FLOW-11 | Export PDF dan count tidak memeriksa ownership di controller; GET membuat/upload dokumen; bulk fetch URL tersimpan tanpa allowlist di controller. |
| FLOW-12 | Slip gaji mengunggah data tanda tangan; update parent/child/upload tidak transactional; delete membiarkan child historis. |
| FLOW-13 | Audit created_by/updated_by berasal request; acknowledgment truthy selalu ditimpa sekarang, termasuk cancellation. |
| FLOW-14 | Tidak ada validator backend untuk nominal/tenor/zero, enum status atau kelengkapan dokumen; perhitungan frontend dipercayai. |
| FLOW-15 | Penempatan kredensial database/cloud pada konfigurasi aplikasi berisiko membuka rahasia; gunakan konfigurasi lingkungan. |
| SUPPORT-01 | Izin Role/Program tidak ditegakkan API admin/perusahaan; seluruh actor admin lolos tanpa cek read/write program. |
| SUPPORT-02 | JWT24h tidak merevalidasi active/blocked/roles setelah login. |
| SUPPORT-03 | Login debitor tidak memeriksa status perusahaan; status debitor dipick tetapi tidak dipilih attrs. |
| SUPPORT-04 | Debitor mendapat totalUsers global. |
| SUPPORT-05 | Operasi parent+child tidak transactional; cek unique sebelum write. |
| SUPPORT-06 | Array child kosong tidak menghapus seluruh bunga/biaya. |
| SUPPORT-07 | Edit child by id tanpa user_id guard. |
| SUPPORT-08 | Body `rest` langsung diteruskan create/update dan audit fields dari request. |
| SUPPORT-09 | Role program dipilih substring, value split `_`, formatter hanya dua role/group. |
| SUPPORT-10 | Parsing nominal berformat dapat menghasilkan nilai salah; normalisasi create/update perlu konsisten tanpa mengubah rumus bisnis. |
| SUPPORT-11 | Public slugs menyertakan seluruh tenant tanpa filter active. |
| SUPPORT-12 | Render PDF dengan URL/cookie bebas tanpa cleanup browser berisiko pada akses jaringan dan pemakaian sumber daya. |
| SUPPORT-13 | Upload dokumen identitas public-read, MIME/ext dipercayai, nama random berentang kecil. |
| SUPPORT-14 | Pagination/sort yang tidak divalidasi dan penanganan error autentikasi yang tidak meneruskan error lain dapat menyebabkan kegagalan atau respons menggantung. |
| SUPPORT-15 | Dashboard credit adalah total nominal pengajuan per status; blocked company tidak masuk totalUsers. |
| SUPPORT-16 | Admin dapat hapus dirinya/last admin; tidak ada guard endpoint. |
| FE-01 | Formula angsuran flat bulanan berbeda istilah annuitas dan skala tahunan PKS/surat; tidak boleh diubah menjadi anuitas tanpa keputusan bisnis |
| FE-02 | Tombol lanjut profil/dokumen dapat melewati validasi form; redirect yang hanya bergantung loading selesai dapat terjadi setelah gagal simpan. |
| FE-03 | Nama konfirmasi diverifikasi di client dan tidak dikirim; checkbox acknowledgment menjadi array `[true]` yang dipakai sebagai timestamp payload. Validasi kuat serta waktu server belum dibuktikan di frontend |
| FE-04 | Pembuatan dokumen yang bergantung pada promise tanpa memeriksa hasil aksi dapat berjalan sesudah penyimpanan gagal; perlu pengujian integrasi. |
| FE-05 | ACL UI disimpan dalam localStorage/cookie yang editable. Add/edit/view hanya membatasi admin; non-admin dapat memasukkan path langsung yang tak ada di menu. Ini bukan bukti server turut rentan; cross-check endpoint |
| FE-06 | Baris biaya tabungan konfigurasi ditampilkan tetapi formula jumlah diterima hanya memotong hardcoded 100.000; potensi mismatch nilai pencairan |
| FE-07 | Nomor dokumen dihitung count+1 saat render, bukan identitas permanen pada frontend. Potensi duplikasi/berubah bergantung query backend dan concurrency |
| FE-08 | Surat memakai bunga r*12 sementara PKS memakai r/tahun; denda constant vs hardcoded 0.2%; administrasiTerbilang menguji provisiPercent, bukan administrasiPercent |
| FE-09 | Konversi base64 yang melanjutkan pembacaan file setelah hasil kosong atau URL yang sudah tersedia berpotensi menghasilkan exception. |
| FE-10 | State passwordRegex global membuat `.test` stateful; KTP minimal 16, email TLD 2–4, nominal required menerima 0; aturan UX tidak seragam |
| FE-11 | Filter tenor <8 juta fallback ke tenor 12 tanpa memverifikasi tenor 12 ada; invalid config/tenor nol bisa menghasilkan NaN/Infinity |
| FE-12 | Tombol Simpan master kredit untuk admin disabled ketika bukan view dan enabled ketika view (ternary terbalik dari non-admin); remarks admin muncul tanpa disabled di view |
| FE-13 | Pengajuan list memakai dataIndex `debitorAcknowledgementTimestamp` (dengan e) sedangkan model/transformer bernama `debitorAcknowledgmentTimestamp`; kolom berpotensi kosong |
| FE-14 | Default konfigurasi bunga menggunakan typo `bungaPersentage`, form/transformer memakai `bungaPercentage`; nilai awal mungkin undefined |
| FE-15 | Halaman terima kasih dapat redirect ke approval ketika URL dokumen masih kosong pada state awal, sebelum pengambilan data selesai. |
| FE-16 | Date tanggalPengajuan ditambah 7 jam saat transform ke API; berpotensi offset ganda bergantung backend/persistence |
| FE-17 | Nama menu/ACL Master Karyawan dan Pengajuan Kredit berbagi CGP; Company Group dibuang dari daftar role admin namun role lain memakai abbreviation. Jangan mengganti pemetaan berdasar nama saja |

## Risiko model dan keputusan skema

- Tipe `NUMBER` pada beberapa field debitor belum memiliki pemetaan SQL yang dipastikan. Nomor telepon yang diperlakukan sebagai angka dapat kehilangan nol awal atau awalan internasional.
- Koordinat `DOUBLE.UNSIGNED` tidak dapat mewakili lintang selatan atau bujur barat. Keputusan perubahan tipe memerlukan penilaian dampak data.
- Nominal, bunga dan penghasilan memiliki tipe campuran string, integer, bigint dan double. Putuskan precision, scale, rounding, format dan overflow setelah memverifikasi data; jangan mengganti rumus.
- Relasi satu-satu belum membuktikan adanya unique constraint fisik. Verifikasi duplikasi dan orphan sebelum menerapkan FK/unique baru.
- Unik untuk username, email, slug dan pasangan nama/jenis perusahaan perlu dipastikan pada database; pemeriksaan aplikasi saja dapat terkena race.
- Mekanisme pembentukan ID `role`, `program` dan `entity_type` belum ditetapkan oleh skema yang terverifikasi.
- Beberapa representasi DTO dan model dapat berbeda, termasuk tipe kewarganegaraan, persen penjamin dan kardinalitas biaya kredit. Pastikan mapping eksplisit dan test.
- `credit_score`, `sum_pengajuan`, `total_angsuran` dan `company_entity` adalah nilai turunan; jangan menganggapnya kolom persistence tanpa keputusan.
- Kolom database dan daftar field respons tidak selalu sama; jangan mengekspos password atau mengasumsikan semua field model tersedia pada semua respons.
- Penghapusan data debitor perlu mempertimbangkan child yang tidak ikut dihapus dan kemungkinan orphan atau penolakan constraint. Pertahankan aturan tidak menghapus debitor yang memiliki kredit.
- Pastikan mapping nama kolom fisik, nama property dan alias relasi tidak menghasilkan kolom ganda atau perubahan bentuk payload.
