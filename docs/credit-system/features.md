# Fitur credit-system

Daftar ini adalah ruang lingkup produk. Model data tambahan tidak otomatis berarti ada layar atau alur aktif.

| Fitur | Kebutuhan |
| --- | --- |
| Login | Mode admin bank, perusahaan, dan debitor; login perusahaan/debitor menggunakan slug; identitas dan akses sesuai aktor. |
| Pendaftaran debitor | Registrasi melalui slug perusahaan, pembuatan akun, login setelah berhasil, dan lanjut melengkapi data. HRD dapat mendaftarkan karyawan. |
| Dashboard | Total perusahaan aktif/tidak aktif untuk admin, jumlah debitor untuk admin/HRD, dan nominal kredit per status sesuai lingkup aktor. |
| Admin User | Daftar, filter, tambah, lihat, ubah, hapus, status aktif, dan hak akses CREATE/READ/UPDATE/DELETE/APPROVAL per program. |
| Perusahaan | Daftar, filter, CSV, tambah, lihat, ubah, hapus dengan pengaman bila masih ada debitor; status, badan usaha, slug, kredensial, bunga per tenor dan biaya. |
| Master Karyawan | Daftar, filter, urutkan, CSV, tambah, lihat, ubah dan hapus; profil pribadi, alamat, kontak, penghasilan dan dokumen. |
| Pengajuan Kredit | Daftar, filter, CSV, tambah/ubah/lihat, simulasi dan tabel bunga; HRD dapat menyetujui atau menolak; unduh perjanjian. |
| Daftar Kredit Karyawan | Admin BPR melihat lintas perusahaan, memfilter, meninjau debitor/kredit, memperbarui nominal, asuransi dan status, serta mengekspor data/dokumen. |
| Status BPR | Debitor dapat membatalkan atau melanjutkan setelah dua tahap persetujuan. |
| Rekening dan persetujuan | Empat field rekening, pernyataan data, konfirmasi nama, rincian biaya dan permintaan pembuatan dokumen. |
| Dokumen | Perjanjian kredit, surat persetujuan, PDF individual, ZIP massal dan halaman terima kasih. |
| Data referensi | Program, jenis entitas, negara, opsi constant, bunga dan biaya per perusahaan. |
| Navigasi | Menu sesuai aktor dan akses program, breadcrumb, halaman tidak ditemukan, loading, filter, pagination, notifikasi dan konfirmasi. |

## Program dan hak akses tampilan

| Program | Akses administrator |
| --- | --- |
| Admin User | `USA_CREATE`, `USA_READ`, `USA_UPDATE`, `USA_DELETE`, `USA_APPROVAL` |
| Daftar Kredit Karyawan | `DKN_CREATE`, `DKN_READ`, `DKN_UPDATE`, `DKN_DELETE`, `DKN_APPROVAL` |
| Master Karyawan | `CGP_CREATE`, `CGP_READ`, `CGP_UPDATE`, `CGP_DELETE`, `CGP_APPROVAL` |
| Pengajuan Kredit | `CGP_CREATE`, `CGP_READ`, `CGP_UPDATE`, `CGP_DELETE`, `CGP_APPROVAL` |
| Daftar Perusahaan | `USC_CREATE`, `USC_READ`, `USC_UPDATE`, `USC_DELETE`, `USC_APPROVAL` |

Perusahaan dan debitor menggunakan menu Master Karyawan dan Pengajuan Kredit. Akses tampilan dan akses API adalah batas terpisah; validasi hak akses aktual harus diuji.

## Form dan filter

- Data debitor meliputi nomor induk, NIK, NPWP, identitas, agama, tanggal/tempat lahir, status keluarga, alamat KTP dan domisili, kontak, pekerjaan, pendidikan, kewarganegaraan dan penghasilan bersih bulanan.
- Dokumen identifikasi: foto KTP, selfie dengan KTP, KK, slip gaji, tanda tangan; NPWP opsional. Form mendukung JPG, PNG dan PDF, satu file per jenis.
- Filter admin: email, username, aktif. Filter perusahaan: email, username, nama perusahaan, status. Filter debitor: nama lengkap dan alias. Filter pengajuan: nama debitor dan NIK. Filter BPR: nama perusahaan, nama debitor, status BPR.
- Bulk download mendukung filter rentang tanggal dan pilihan debitor atau perusahaan sesuai aktor. CSV mengikuti filter dan pengurutan tanpa pagination.
- Filter, urutan, status loading, kegagalan dan tampilan mobile harus diuji bersama aturan bisnis, bukan hanya tampilan sukses.

## Validasi dan detail tampilan

- Registrasi memerlukan nama lengkap, username, password dan konfirmasi password. Aturan password: sekurangnya delapan karakter dengan huruf besar, huruf kecil dan angka; username menerima huruf, angka, titik, underscore dan tanda hubung.
- Form identitas mewajibkan nomor induk, NIK, nama lengkap, jenis kelamin, agama, tempat/tanggal lahir, status perkawinan, nama ibu kandung, alamat KTP, provinsi, kota, kecamatan, kelurahan, kode pos, alamat domisili dan pendapatan bulanan. Lima dokumen wajib adalah KTP, selfie KTP, KK, slip gaji dan tanda tangan.
- Form permohonan menampilkan nominal, tenor, bunga dan angsuran; simulasi menampilkan pilihan tenor dan tabel bunga perusahaan. Pada nominal di bawah Rp8.000.000, tenor lebih dari 12 bulan tidak ditawarkan.
- Form approval BPR memuat status, nominal, tenor, bunga, angsuran dan biaya asuransi jiwa. Sesudah `approved`, jumlah tidak diedit melalui form dan pilihan penolakan dinonaktifkan. Sesudah `rejected`/`completed`, form edit terkunci.
- Form rekening memerlukan bank, cabang, nama rekening, nomor rekening, persetujuan kebenaran data dan nama yang sama persis dengan nama debitor. Halaman dokumen memuat perjanjian delapan pasal dan rincian biaya/surat persetujuan.
- List pada umumnya terurut `createdAt` menurun; Master Karyawan juga dapat diurutkan berdasarkan id, nomor induk dan nama. Debitor melihat data miliknya; HRD melihat lingkup perusahaannya; admin menggunakan hak program yang ditetapkan.
- Beberapa aturan form seperti panjang NIK, pengenalan email dan input nominal memiliki celah atau batasan. Catatan terkait ada di [logic-holes.md](logic-holes.md); jangan menambah pengetatan yang mengubah alur tanpa mencatat dampaknya.

## Cakupan yang tidak ditambahkan

Tidak ada alur baru untuk ledger cicilan, pencairan otomatis, autodebit payroll, jadwal amortisasi, integrasi SLIK, OTP, e-KYC, atau tanda tangan tersertifikasi. Data keluarga, GPS, SLIK/BMPK dan penjamin tetap tercakup dalam model, tetapi tidak otomatis menjadi form wajib.
