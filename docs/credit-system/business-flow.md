# Alur bisnis credit-system

Sumber tunggal aturan dan cakupan bisnis. Status pengerjaan ada di [development-plan.md](development-plan.md); risiko dan keputusan terbuka ada di [logic-holes.md](logic-holes.md).

## Aktor

| Aktor | Peran |
| --- | --- |
| Admin bank/BPR | Mengelola administrator, perusahaan, produk dan meninjau kredit yang disetujui HRD. |
| Perusahaan/HRD | Mengelola karyawan dan melakukan persetujuan awal atas pengajuan mereka. |
| Debitor/nasabah | Mendaftar, melengkapi profil, mengajukan kredit dan mengonfirmasi persetujuan. |

Perusahaan diidentifikasi melalui slug. Nama badan usaha, produk, tenor, bunga, dan biaya merupakan konfigurasi per perusahaan.

## Alur utama

1. Admin mengatur administrator dan izin program; mendaftarkan perusahaan dan mengatur bunga per tenor serta komponen biaya.
2. Nasabah mendaftar pada perusahaan, login dengan slug, lalu mengisi profil, penghasilan, dan dokumen. HRD juga dapat mendaftarkan karyawan.
3. Nasabah mengajukan nominal dan tenor. Pilihan bunga berasal dari konfigurasi perusahaan. Status HRD awal pada form adalah `pending`.
4. HRD melihat pengajuan karyawannya dan memilih `approved` atau `rejected`.
5. BPR melihat pengajuan yang disetujui HRD, memeriksa identitas, pendapatan, nominal, tenor, angsuran, skor informatif, dan asuransi jiwa; kemudian memilih status BPR `approved`, `rejected`, atau `completed`. Penolakan BPR dari form juga menetapkan status HRD `rejected`.
6. Persetujuan BPR menghasilkan snapshot biaya dari konfigurasi perusahaan dan notifikasi WhatsApp berisi tautan status untuk nasabah.
7. Pada halaman status, nasabah dapat membatalkan atau melanjutkan ketika HRD dan BPR sama-sama `approved`. Pembatalan mengirim status BPR `rejected` dan acknowledgment; status HRD tidak ikut diubah oleh aksi ini.
8. Nasabah mengisi bank, cabang, nama dan nomor rekening, menyatakan persetujuan dan mengetik nama lengkap yang sama dengan nama debitor. Waktu acknowledgment ditetapkan server. Setelah rekening tersimpan, sistem membuat PDF perjanjian, menyimpan URL, dan menampilkan halaman terima kasih.
9. Dokumen tersedia untuk diunduh; perusahaan dan admin dapat mengekspor data CSV dan mengunduh dokumen tunggal maupun ZIP sesuai fitur dan filter. `completed` adalah status administratif; proses penerimaan cicilan dan pencairan aktual tidak didefinisikan di sini.

## Status dan kondisi

| Data | Nilai dan aturan |
| --- | --- |
| `status` | Status HRD: `pending`, `approved`, `rejected`, `completed`. Edit pengajuan debitor dan verifikasi HRD terkunci pada `approved`/`rejected`. |
| `status_admin_approval` | Status BPR: opsi form `approved`, `rejected`, `completed`; `pending` dikenal dalam daftar umum. Form BPR terkunci pada `rejected`/`completed`. |
| Perubahan ke `completed` | Form BPR tidak mensyaratkan status BPR sebelumnya `approved`; jangan menambahkan prasyarat tanpa keputusan bisnis. |
| `debitor_acknowledgment_timestamp` | Nilai truthy pada request menghasilkan waktu server; dipakai juga pada pembatalan nasabah. |
| Dokumen selesai | Acknowledgment terisi, BPR `approved`, dan `doc_url` terisi mengarahkan ke halaman terima kasih. |

Ini menjelaskan jalur UI dan kondisi yang perlu dijaga, bukan jaminan semua transisi telah ditegakkan oleh backend.

## Rumus dan rincian biaya

| Nilai | Rumus atau ketentuan |
| --- | --- |
| Angsuran bulanan | `round(P * r / 100 + P / n, 0)`; P nominal pengajuan, r persen bunga per bulan, n tenor dalam bulan. |
| Total angsuran | `Number(jumlah_angsuran) * Number(jangka_waktu_bulan)`. |
| Jumlah pengajuan terbuka | Jumlah nominal untuk status HRD `pending` dan `approved`; status BPR tidak diperiksa. |
| Credit score | Pendapatan bulanan dikurangi jumlah pengajuan terbuka; nilai informatif, tidak menentukan persetujuan otomatis. |
| Biaya `%` | Nominal pengajuan dikali nilai biaya dibagi 100. |
| Biaya `x` | Angsuran bulanan dikali nilai biaya. |
| Biaya lain | Nilai biaya langsung. |
| Biaya ditampilkan | Total snapshot selain nama yang mengandung `tabungan`, ditambah asuransi jiwa dan materai Rp10.000. |
| Nilai diterima ditampilkan | Nominal pengajuan dikurangi total biaya dan tabungan tetap Rp100.000. |

Nominal di bawah Rp8.000.000 membatasi pilihan tenor hingga 12 bulan; nominal tepat Rp8.000.000 dapat menggunakan tenor lebih panjang jika tersedia. Contoh: Rp12.000.000 selama 12 bulan dengan bunga 1% per bulan menghasilkan angsuran Rp1.120.000 dan total Rp13.440.000.

Persyaratan tertulis pada dokumen menyebut annuitas dan bunga tahunan, sementara perhitungan tersebut bersifat flat bulanan. Pertahankan rumus sampai ada keputusan untuk mengubahnya. Surat persetujuan dan perjanjian dapat berbeda dalam penyajian bunga dan denda; lihat catatan risiko.

## Perjanjian dan rekening

Nomor perjanjian ditampilkan sebagai `<nomor urut>/BPR-<nama perusahaan uppercase tanpa pemisah>/<MM/YYYY>`. Nomor urut berasal dari hitungan dokumen pada bulan pembuatan kredit, ditambah satu, dengan setidaknya dua digit. Tanggal perjanjian mengikuti acknowledgment; cicilan pertama adalah satu bulan sesudahnya dan tanggal akhir adalah acknowledgment ditambah tenor.

PDF memuat identitas bank, perusahaan dan debitor, nominal dan terbilang, tenor, bunga, biaya, denda, delapan pasal perjanjian dan surat persetujuan. Teks mengenai pembayaran, pelunasan, atau pencairan tidak dengan sendirinya mendefinisikan fitur transaksi otomatis.

## Cakupan fitur dan data nasabah

| Kelompok fitur | Cakupan di luar alur kredit utama |
| --- | --- |
| Administrasi | CRUD administrator/role dan perusahaan; pengaman hapus perusahaan yang memiliki debitor. |
| Master Karyawan | Registrasi publik melalui slug, pendaftaran oleh HRD, profil, penghasilan, dokumen, daftar/detail/edit dan pengaman hapus bila memiliki kredit. |
| Review dan pelaporan | Daftar Kredit Karyawan lintas perusahaan untuk BPR, ekspor sesuai filter, PDF tunggal dan ZIP dokumen. |
| Dashboard | Total perusahaan active/inactive (blocked tidak dihitung), jumlah debitor sesuai aktor (nol bagi debitor), nominal pengajuan per status HRD. Total perusahaan global tetap perlu keputusan untuk aktor debitor (SUPPORT-04). |
| Referensi dan navigasi | Kamus program, badan usaha, negara, constant; menu sesuai aktor, breadcrumb, kondisi kosong/gagal dan tampilan mobile. |

Registrasi memerlukan nama lengkap, username, password dan konfirmasi. Password registrasi minimal delapan karakter, mengandung huruf besar/kecil dan angka; username menerima huruf, angka, titik, underscore dan tanda hubung. Ini kebutuhan registrasi nasabah, bukan klaim validasi seluruh form sudah tersedia.

Profil mencakup nomor induk, NIK, NPWP, identitas/agama, tempat/tanggal lahir, keluarga, kontak, alamat KTP/domisili, pekerjaan/pendidikan, kewarganegaraan dan pendapatan bersih bulanan. Yang wajib: nomor induk, NIK, nama, jenis kelamin, agama, tempat/tanggal lahir, status perkawinan, nama ibu, alamat KTP beserta provinsi/kota/kecamatan/kelurahan/kode pos, domisili dan pendapatan.

Lima dokumen wajib: KTP, selfie KTP, KK, slip gaji dan tanda tangan; NPWP opsional. JPG, PNG dan PDF didukung, satu file per jenis. Pemetaan slip gaji/tanda tangan harus dibedakan.

Pada review BPR, form approved membuat nominal tidak dapat diedit dan tidak menawarkan penolakan; kunci rejected/completed mengikuti tabel status di atas. Daftar BPR awalnya memfilter HRD approved. Master Karyawan mendukung urutan id/nomor induk/nama; filter dan transport API dirinci hanya dalam kontrak API.

Tidak menambah ledger cicilan, pencairan otomatis, autodebit payroll, amortisasi, integrasi SLIK, OTP, e-KYC atau tanda tangan tersertifikasi. Data keluarga/GPS/SLIK/BMPK/penjamin pada model tidak otomatis menjadi form wajib.
