# Kontrak API credit-system

Kontrak berikut merangkum kebutuhan fungsi dan route yang perlu dipertahankan atau dipetakan secara eksplisit. Implementasi Hono RPC dan schema Zod belum tersedia. Bentuk snake_case persistence dan camelCase response harus dipetakan dan diuji; keputusan perubahan path/status error harus dicatat.

## Autentikasi dan referensi

| Method dan path | Fungsi |
| --- | --- |
| `POST /api/login` | Login `admin`, `company`, atau `debitor`; response `authToken`, `type`, `userData`; JWT HS256 dengan claim id, slug, type dan masa berlaku 24 jam. |
| `GET /api/user/slugs` | Pilihan perusahaan untuk navigasi tenant. |
| `GET /api/programs` | Daftar program dan abbreviation. |
| `GET /api/entity-types` | Daftar jenis entitas perusahaan. |
| `GET /api/countries` | Daftar negara. |
| `GET /api/constants` | Daftar nilai referensi, dengan filter nama opsional. |
| `GET /api/dashboard/data` | `totalUsers`, `totalDebitor`, `totalCredits`; nominal kredit dikelompokkan menurut status HRD. |

Registrasi debitor, login dan slug dapat diakses sebelum JWT; endpoint lain membutuhkan bearer token. Aktor perusahaan login ketika status perusahaan `active`. Login admin memerlukan akun aktif. Data pengguna pada respons dan batas akses menurut aktor perlu diuji, termasuk pembatasan resource di backend.

- Admin login dengan username atau email dan password; respons memuat identitas dan role yang dikelompokkan per program, dengan slug `admin`. Perusahaan login dengan username atau email, password dan slug. Debitor login dengan username, password dan slug perusahaan.
- Password diperiksa dengan bcrypt. Klaim JWT hanya memuat `id`, `slug`, `type`; role dan status tidak berada di dalam token. Akun yang tidak ditemukan/tidak sesuai kredensial menghasilkan respons kredensial salah; perbedaan status HTTP perlu diuji pada implementasi kontrak.
- Dashboard `totalUsers` menghitung perusahaan `active` dan `inactive`; `blocked` tidak termasuk. `totalDebitor` dibatasi ke perusahaan bagi HRD dan bernilai nol bagi debitor. `totalCredits` menjumlahkan nominal pengajuan berdasarkan status HRD `pending`, `approved`, `completed` dan dibatasi lingkup aktor; nilainya bukan jumlah baris atau saldo terutang.

## Administrasi dan perusahaan

| Method dan path | Fungsi |
| --- | --- |
| `GET /api/admin-users`, `GET /api/admin-user` | Daftar/filter dan detail administrator dengan role/program. |
| `POST /api/admin-user/create`, `PUT /api/admin-user/update`, `PUT /api/admin-user/delete` | Pengelolaan administrator dan role. |
| `GET /api/users`, `GET /api/user`, `GET /api/user/export` | Daftar/filter, detail dan CSV perusahaan. |
| `POST /api/user/create`, `PUT /api/user/update`, `PUT /api/user/delete` | Pengelolaan perusahaan serta konfigurasi bunga/biaya; hapus dibatasi bila mempunyai debitor. |
| `GET /api/user/bunga-kredits` | Daftar bunga dan tenor perusahaan terkait slug. |

Perusahaan membawa jenis badan usaha, nama, email, username, slug, status, pengaturan bunga dan biaya. Benturan username/email atau kombinasi nama dan jenis entitas dicek sebelum create/update. Pembaruan array bunga dan biaya merekonsiliasi detail yang dikirim; perilaku array kosong tercatat sebagai risiko untuk divalidasi. Pada administrator, password di-hash dan setiap role memetakan nilai `READ`/`WRITE` ke program; edit role mengganti daftar role.

Admin user mendukung filter email, username dan aktif. Perusahaan mendukung email, username, nama badan usaha+nama perusahaan dan status. Daftar menggunakan pengurutan dan pagination; CSV perusahaan mengikuti filter/pengurutan tanpa pagination dan mencakup identitas, status, serta audit.

## Debitor dan kredit

| Method dan path | Fungsi |
| --- | --- |
| `POST /api/debitor/create` | Pendaftaran debitor; return id; username diperiksa dan password di-hash. |
| `GET /api/debitors`, `GET /api/debitor` | Daftar/filter dan detail debitor beserta data terkait. |
| `PUT /api/debitor/update`, `PUT /api/debitor/delete` | Update profil, finansial/dokumen; tolak hapus jika mempunyai kredit. |
| `GET /api/debitor/export` | CSV identitas dan jumlah pengajuan terbuka. |
| `POST /api/credit/create` | Membuat pengajuan; return id. |
| `GET /api/credits`, `GET /api/credit` | Daftar/detail, filter, pagination, total angsuran dan skor untuk admin. |
| `PUT /api/credit/update` | Update pengajuan dan detail terkait; proses status HRD/BPR, biaya dan notifikasi sesuai [business-flow.md](business-flow.md). |
| `GET /api/credit/export` | CSV kredit sesuai filter; format karyawan BPR memakai tipe `/kredit-karyawan`. |
| `GET /api/credit/export/bulk` | Mengumpulkan dokumen PDF terfilter sebagai ZIP dan mengembalikan URL/nama. |
| `GET /api/credit/export/doc` | Meminta render PDF dan menyimpan URL pada kredit. |
| `GET /api/credit/doc/count` | Jumlah dokumen dalam bulan pembuatan kredit untuk penomoran. |

Filter kredit mencakup perusahaan, rentang tanggal dibuat, debitor, nama, NIK, status HRD/BPR dan perusahaan. Admin memperoleh daftar berstatus HRD `approved` sebagai kondisi awal. Detail dan risiko filter/otorisasi harus dikaji berdasarkan [logic-holes.md](logic-holes.md).

- Detail kredit mencakup debitor/perusahaan, biaya, collection, guarantor, insurance, potongan, SLIK/BMPK dan spouse. Update mendukung upsert collection, guarantor, insurance, potongan, SLIK/BMPK dan spouse; snapshot expense dibuat pada approval.
- Daftar debitor menyediakan `count`, data debitor dan jumlah pengajuan terbuka. Detail memuat profil, dokumen dan data finansial. Filter utama: id, nama lengkap dan alias. CSV memuat nomor induk, nama lengkap, alias, NIK dan jumlah pengajuan terbuka.
- Daftar kredit menyediakan `count`, data kredit, total angsuran, dan untuk admin skor serta jumlah pengajuan. Filter tanggal menggunakan awal/akhir hari; nama perusahaan dan nama debitor menggunakan pencarian parsial. CSV menyediakan format pengajuan umum dan format daftar kredit karyawan, termasuk status HRD/BPR, rekening dan tanggal.
- Ekspor ZIP mengambil kredit yang memiliki URL dokumen, membatasi pengambilan paralel hingga lima, menamai PDF dengan id debitor/kredit, identitas perusahaan dan bulan/tahun, lalu mengembalikan nama dan URL arsip. Kasus dokumen tidak ditemukan menghasilkan error.
- Permintaan dokumen menghasilkan PDF A4 dari halaman perjanjian, menyimpan URL pada kredit dan mengembalikan URL. Penomoran menggunakan jumlah dokumen bulan pembuatan kredit, tidak dibatasi perusahaan. Validasi akses, konkurensi, response dan batas input harus diuji; lihat catatan risiko.

## Implementasi referensi P01

P01 menyediakan array DTO: program `{id, name, abbreviation}`, jenis entitas `{id, value}`, negara `{id, code, value}`, constant `{id, name, type, value}`, dan slug `{id, slug, companyName}`. Kolom model yang belum memiliki NOT NULL dapat bernilai null. `GET /api/constants?name=...` mencocokkan nama secara tepat. Slug publik memuat semua perusahaan tanpa filter status, sesuai perilaku yang masih perlu diputuskan pada SUPPORT-11. Empat endpoint referensi lainnya menolak semua request dengan 401 sampai verifikasi identitas P02 tersedia; fixture identity hanya dipasang pada app test, tidak dapat diaktifkan lewat header di aplikasi.
