# Kontrak API credit-system

Kontrak berikut merangkum kebutuhan fungsi dan route yang perlu dipertahankan atau dipetakan secara eksplisit. Implementasi Hono RPC dan schema Zod tersedia untuk login dan referensi; endpoint lainnya masih berupa kebutuhan. Bentuk snake_case persistence dan camelCase response harus dipetakan dan diuji; keputusan perubahan path/status error harus dicatat.

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
| `GET /api/admin-user/list`, `GET /api/admin-user/detail` | Daftar/filter dan detail administrator dengan role/program. |
| `POST /api/admin-user/create`, `PUT /api/admin-user/update`, `PUT /api/admin-user/delete` | Pengelolaan administrator dan role. |
| `GET /api/user/list`, `GET /api/user/detail`, `GET /api/user/export` | Daftar/filter, detail dan CSV perusahaan. |
| `POST /api/user/create`, `PUT /api/user/update`, `PUT /api/user/delete` | Pengelolaan perusahaan serta konfigurasi bunga/biaya; hapus dibatasi bila mempunyai debitor. |
| `GET /api/user/bunga-kredits` | Daftar bunga dan tenor perusahaan terkait slug. |

Perusahaan membawa jenis badan usaha, nama, email, username, slug, status, pengaturan bunga dan biaya. Benturan username/email atau kombinasi nama dan jenis entitas dicek sebelum create/update. Pembaruan array bunga dan biaya merekonsiliasi detail yang dikirim; perilaku array kosong tercatat sebagai risiko untuk divalidasi. Pada administrator, password di-hash dan setiap role memetakan nilai `CREATE`/`READ`/`UPDATE`/`DELETE`/`APPROVAL` atau `WRITE` lama ke program; edit role mengganti daftar role.

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

P01 menyediakan array DTO: program `{id, name, abbreviation}`, jenis entitas `{id, value}`, negara `{id, code, value}`, constant `{id, name, type, value}`, dan slug `{id, slug, companyName}`. Kolom model yang belum memiliki NOT NULL dapat bernilai null. `GET /api/constants?name=...` mencocokkan nama secara tepat. Slug publik memuat semua perusahaan tanpa filter status, sesuai perilaku yang masih perlu diputuskan pada SUPPORT-11. Empat endpoint referensi lainnya memerlukan bearer JWT yang valid dan identitas aktif sesuai aturan P02; fixture identity hanya dipasang pada app test.

## Implementasi autentikasi P02

Login menerima `{type, username, password, slug?}`; slug wajib untuk perusahaan dan debitor. Response `{authToken, type, userData}` tidak menyertakan hash password. Input tidak valid menghasilkan 400 dan kredensial salah menghasilkan 401. Referensi privat memverifikasi token dan memuat status akun serta role terkini pada setiap request. `JWT_SECRET` harus disediakan melalui environment. Session UI berada dalam memori dan berakhir saat reload atau keluar.

## Implementasi Admin User P03

`GET /api/admin-user/list` menerima filter `email`, `username`, `active`, serta `page` dan `limit`. Sorting opsional: `sortBy` (`createdAt`, `username`, `email`, `isActive`; default `createdAt`) dan `sortDirection` (`asc`/`desc`; default `desc`), dengan id menurun sebagai tie-breaker; respons `{count, data}` tidak menyertakan password. `GET /api/admin-user/detail?id=...` menyertakan `roles` berisi `{programId, value}`. Create menerima `{username, email, password, isActive, roles}`; update menambahkan `id` dan password opsional; delete menerima `{id}`. Penulisan dan penggantian role dilakukan dalam transaksi. Endpoint membaca memerlukan USA_READ, endpoint menulis memerlukan USA_CREATE, USA_UPDATE, atau USA_DELETE sesuai aksi; WRITE lama memberikan semua izin CRUD. Input salah menghasilkan 400, identitas tidak valid 401, izin tidak cukup 403, data tidak ditemukan 404, dan konflik akun/program 409. Pemeriksaan konflik belum menjamin keunikan saat request paralel tanpa constraint database terverifikasi.

`GET /api/admin-user/export` menerima `format=pdf|xlsx` dan filter serta sorting yang sama dengan listing; seluruh hasil yang cocok diekspor tanpa pagination. Membutuhkan USA_READ atau USA_WRITE.

## Implementasi P04

API perusahaan: GET user/list (listing), GET user/detail?id, POST user/create, PUT user/update dan PUT user/delete dengan id. CRUD administratif memerlukan USC_READ/WRITE; WRITE termasuk READ. Payload camelCase: entityTypeId, companyName, email, username, slug, status (active/inactive/blocked), password (wajib create), bungaKredits [{id?, bungaPercentage, jangkaWaktuBulan}], biaya [{id?, expenseType, type, value}]. Array merupakan konfigurasi lengkap: child yang tidak dikirim dihapus, array kosong menghapus semua. ID child wajib milik parent; error 400/401/403/404/409.

GET user/bunga-kredits?slug memerlukan identitas: company/debitor dibatasi slug sendiri; admin dapat membaca konfigurasi untuk simulasi. GET user/export?format=pdf|xlsx memerlukan USC_READ, memakai filter/sorting listing tanpa pagination. Filter users: email, username, companyName, entityTypeId, status, page, limit, sortBy dan sortDirection. Tidak ada perubahan skema atau migration baru.

## Route per fitur dan ACL granular

Route Admin User berada pada `/api/admin-user/{list,detail,create,update,delete,export}`, route perusahaan pada `/api/user/{list,detail,create,update,delete,export,slugs,bunga-kredits}`. Method dan payload mengikuti handler sebelumnya. Perubahan path ini memerlukan pembaruan client; path lama tidak tersedia.

Middleware menerima ACL berupa `<PROGRAM>_<CREATE|READ|UPDATE|DELETE|APPROVAL>`. Role disimpan sebagai program dan nilai aksi: lebih dari satu aksi dapat diberikan pada program yang sama. Role lama READ tetap memberikan READ; WRITE memberikan CREATE/READ/UPDATE/DELETE. APPROVAL harus diberikan secara eksplisit; WRITE tidak mencakupnya. Tidak ada endpoint approval yang ditambahkan pada phase ini.
