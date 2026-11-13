# Kontrak API

Sumber tunggal path, payload, DTO dan otorisasi. Bagian berjalan sudah diimplementasikan P00–P05; bagian rancangan belum menjamin endpoint tersedia. Semua path berprefix /api dan persistence dipetakan ke camelCase. Perubahan kompatibilitas dicatat di logic-holes.md.

## Ketentuan umum dan ACL

Respons berhasil: baca/update/delete 200, create 201. Error `{error: string}`: input/JSON malformed 400, identitas/kredensial invalid 401, izin/scope ditolak 403, data tidak ditemukan 404, konflik bisnis yang diketahui 409. Error internal tidak mengekspos stack trace/pesan database. Implementasi fallback internal belum distandarkan sebagai JSON global.

ACL berbentuk PROGRAM_ACTION, dengan aksi CREATE, READ, UPDATE, DELETE, APPROVAL; setiap aksi eksplisit. Role `{programId, value}` dapat berisi beberapa aksi per program, tanpa duplikasi pasangan. WRITE tidak diterima. Migration 0001 mengonversi role lama ke empat aksi CRUD tanpa Approval; detail migrasi pada data-model.md.

| Program | Resource | Status |
| --- | --- | --- |
| USA | Admin User | Berjalan; belum ada endpoint Approval |
| USC | Perusahaan | Berjalan; belum ada endpoint Approval |
| CGP | Master Karyawan dan Pengajuan Kredit | Karyawan berjalan P05, kredit berjalan P06; jangan memisahkan kode tanpa keputusan |
| DKN | Review BPR/Daftar Kredit Karyawan | Rancangan |

List/detail/export administratif memerlukan PROGRAM_READ; create/update/delete memakai aksi masing-masing. UI bukan sumber otorisasi; scope aktor/tenant tetap diperiksa server.

## API berjalan

### Login dan referensi

| Method/path | Kontrak dan akses |
| --- | --- |
| POST /login | Publik, body `{type, username, password, slug?}`; type admin/company/debitor, slug wajib bagi tenant. Respons `{authToken, type, userData}` tanpa password. |
| GET /health | Publik, pemeriksaan kesehatan. |
| GET /user/slugs | Publik, array `{id, slug, companyName}`; semua status perusahaan masih disertakan (SUPPORT-11). |
| GET /programs | JWT; `{id, name, abbreviation}[]`. |
| GET /entity-types | JWT; `{id, value}[]`. |
| GET /countries | JWT; `{id, code, value}[]`. |
| GET /constants?name=... | JWT; `{id, name, type, value}[]`; name opsional dan dicocokkan tepat. |

Admin/perusahaan login dengan username atau email; debitor dengan username. Bcrypt dan JWT HS256 24 jam memakai claim id/slug/type/exp, JWT_SECRET dari environment. Admin harus aktif, perusahaan harus active; status perusahaan pada login debitor masih SUPPORT-03. Identitas dan role terkini dimuat ulang tiap request privat. DTO referensi yang kolomnya nullable dapat memuat null. Sesi UI disimpan dalam memori dan berakhir saat reload/logout.

### Route administratif

| Fitur/prefix | GET | POST | PUT |
| --- | --- | --- | --- |
| Admin User: /admin-user | /list, /detail?id=..., /export?format=pdf\|xlsx | /create | /update, /delete |
| Perusahaan: /user | /list, /detail?id=..., /export?format=pdf\|xlsx | /create | /update, /delete |

Path lama /admin-users, /admin-user, /users dan /user tanpa child tidak tersedia. Client harus menggunakan child route di tabel. Delete menerima `{id}`. Update menambahkan id ke payload create dan password opsional. List mengembalikan `{count, data}`; password tidak disertakan. Default page=1, limit=20 (maksimum 100), sortDirection=desc, sortBy=createdAt; tie-breaker id menurun. Ekspor memakai filter/sort yang sama tanpa pagination dan respons file attachment dalam format PDF/XLSX/CSV.

| Fitur | Body create | Filter/sort |
| --- | --- | --- |
| Admin User | username, email, password, isActive, roles: [{programId, value}] | email, username, active; sortBy createdAt/username/email/isActive |
| Perusahaan | entityTypeId, companyName, email, username, slug, status, password, bungaKredits, biaya | email, username, companyName, entityTypeId, status; sortBy createdAt/companyName/username/email/status |

Admin detail menyertakan roles. Save mengganti seluruh daftar role. Perusahaan status active/inactive/blocked; slug format huruf kecil/angka dipisahkan tanda hubung. Bunga `[{id?, bungaPercentage, jangkaWaktuBulan}]` memakai string numerik; bunga nonnegatif, tenor integer positif. Biaya `[{id?, expenseType, type, value}]` memakai integer nonnegatif untuk value. Array adalah konfigurasi lengkap: child yang dihilangkan dihapus, termasuk seluruh child jika array kosong. ID child harus milik parent dan tidak duplikat. Konflik username/email, nama+badan usaha atau slug menghasilkan 409; jenis entitas harus tersedia. Hapus perusahaan yang masih memiliki debitor menghasilkan 409.

GET /user/bunga-kredits?slug=... memerlukan JWT; company/debitor hanya slug sendiri. Admin boleh membaca konfigurasi untuk simulasi. Respons array bunga/tenor; route ini bukan akses CRUD perusahaan.

### Registrasi dan Master Karyawan (P05)

Prefix /debitor: POST /register publik menerima {slug, namaLengkap, username, password}; POST /create privat menerima akun dan userId opsional (wajib untuk admin); PUT /update menerima {id, namaLengkap, username, password?}. Payload strict: field internal/audit/approval ditolak. Registrasi menyimpan akun lalu client melakukan login biasa; kegagalan login tidak diklaim sebagai registrasi gagal.

GET /list menerima namaLengkap, namaAlias, userId, sortBy id/employeeId/namaLengkap/createdAt, sortDirection, page/limit; GET /detail?id dan PUT /delete {id}. Admin memerlukan CGP aksi terkait. HRD mengelola perusahaan sendiri; debitor hanya membaca/mengubah akun sendiri, tanpa create/delete privat. Filter tidak dapat menimpa scope. Username unik per tenant diperiksa sambil lock perusahaan; password di-hash dan tidak pernah dikirim kembali. Delete membersihkan keenam child, menolak kredit ketika tabel credit tersedia; verifikasi kredit nyata pada P06.

PUT /profile menerima {id, profile}: identitas wajib sesuai business-flow, takehomePay string integer nonnegatif maksimum 4294967295, field profil opsional string kosong. Tanggal YYYY-MM-DD dikirim tanpa offset; nomor telepon string. POST /documents memakai multipart id dan file fotoUrl/selfieUrl/kkUrl/slipGajiUrl/tandaTanganUrl serta npwpUrl opsional. Lima dokumen harus tersedia dari simpan lama atau file baru; satu file per jenis, JPEG/PNG/PDF dengan signature/MIME/extension sesuai, maksimum 10 MB/file, total request 64 MB. Client tidak dapat mengirim URL/file key.

Detail menambahkan profile dan documents (URL unduhan privat atau null). GET /document?id&kind memeriksa READ dan ownership sebelum mengirim attachment no-store. File disimpan lewat adapter disk privat; kegagalan upload/SQL membersihkan file baru, SQL rollback. GET /export?format=pdf|xlsx|csv memakai query listing yang sama tanpa pagination/batas data dan scope identik.

### Pengajuan kredit (P06)

P08: GET /credit/review/list dan /detail?id memerlukan DKN_READ; daftar default HRD approved. GET /credit/review/export memakai filter/scope daftar tanpa pagination. PUT /credit/review memerlukan admin DKN_APPROVAL, dan perubahan nominal/tenor/asuransi juga memerlukan DKN_UPDATE. Body strict berisi id, statusAdminApproval, jumlahPengajuan, jangkaWaktuBulan, biayaAsuransiJiwa. Approval membuat snapshot biaya dan mengunci nominal; rejected juga mengubah HRD menjadi rejected; rejected/completed terkunci. Completed tidak memerlukan approval BPR sebelumnya. Pengulangan approval menghasilkan 409. Respons memuat id dan notification sent/failed/not-configured/not-required; keputusan tetap tersimpan jika pengiriman gagal. Tidak ada retry otomatis atau antrean persisten.

P07: PUT /credit/update juga menerima body strict `{id, status}` dengan status `approved` atau `rejected`, hanya untuk HRD perusahaan pemilik. Keputusan hanya tersedia dari `pending`; status lain dan pengulangan menghasilkan 409. Debitor/admin atau HRD tenant lain mendapat 403. Audit ditentukan server. Payload keputusan tidak dapat dicampur dengan field pengajuan atau biaya.

Prefix /credit memuat GET /list dan /detail?id, POST /create dan /simulation, PUT /update serta GET /rates?id dan /export?format=pdf|xlsx|csv. Body create/simulation berupa debitorId, jumlahPengajuan, jangkaWaktuBulan dan tanggalPengajuan; update menambahkan id. Nominal menerima digit atau pemisah ribuan titik. Collection, guarantor, insurance, slikBmpk dan spouse opsional disimpan sebagai child dalam transaksi; input approval, rekening dan biaya ditolak. Detail mengembalikan parent, child dan total angsuran. Daftar menerapkan filter perusahaan/debitor, nama/NIK, status, tanggal, urutan dan pagination; ekspor memakai filter dan scope daftar tanpa pagination. Scope perusahaan dan identitas debitor ditetapkan server, sedangkan admin memerlukan CGP sesuai aksi. Edit terkunci pada HRD approved/rejected.

## Ringkasan dashboard

| Method dan path | Fungsi |
| --- | --- |

Filter kredit mencakup perusahaan, rentang tanggal dibuat, debitor, nama, NIK dan status HRD/BPR. Admin memperoleh daftar berstatus HRD `approved` sebagai kondisi awal. Detail dan risiko filter/otorisasi harus dikaji berdasarkan [logic-holes.md](logic-holes.md).

- Detail kredit mencakup debitor/perusahaan, biaya, collection, guarantor, insurance, potongan, SLIK/BMPK dan spouse. Update mendukung upsert collection, guarantor, insurance, potongan, SLIK/BMPK dan spouse; snapshot expense dibuat pada approval.
- Daftar debitor menyediakan `count`, data debitor dan jumlah pengajuan terbuka. Detail memuat profil, dokumen dan data finansial. Filter utama: id, nama lengkap dan alias. CSV memuat nomor induk, nama lengkap, alias, NIK dan jumlah pengajuan terbuka.
- Daftar kredit menyediakan `count`, data kredit, total angsuran, dan untuk admin skor serta jumlah pengajuan. Filter tanggal menggunakan awal/akhir hari; nama perusahaan dan nama debitor menggunakan pencarian parsial. CSV menyediakan format pengajuan umum dan format daftar kredit karyawan, termasuk status HRD/BPR, rekening dan tanggal.


GET /dashboard/data memerlukan sesi dan mengembalikan totalUsers (jumlah global active/inactive), totalDebitor (jumlah sesuai aktor), totalCredits {pending, approved, completed} (nominal string desimal sesuai scope aktor dan status HRD). CSV perusahaan pada P11 melengkapi ekspor PDF/XLSX yang telah tersedia; format dan path final harus ditetapkan sebelum implementasi.

Dashboard merupakan pembacaan terotorisasi dan tidak mengubah data.

P09-T01: `PUT /credit/cancel` menerima `{ "id": number }` dari debitor pemilik. Dua status approval harus approved dan acknowledgment belum ada; transaksi menetapkan status BPR rejected serta tanggal acknowledgment server, tanpa mengubah HRD. Pengulangan menghasilkan 409. Kolom acknowledgment bertipe DATE sehingga hanya tanggal disimpan.

P09-T02: `GET /credit/status?id=` hanya untuk debitor pemilik dan memuat rincian biaya snapshot. `PUT /credit/confirm` menerima `id`, `bankName`, `bankBranch`, `bankAccountName`, `bankAccountNumber`, `confirmationName`, `confirmed: true`; nama konfirmasi harus sama persis dengan nama debitor. Kedua approval harus approved dan acknowledgment belum ada. Server menetapkan tanggal acknowledgment; pengulangan menghasilkan 409.

P10: POST `/credit/doc/render` dengan `{id}` hanya untuk debitor pemilik dengan dua approval, acknowledgment dan rekening lengkap; menghasilkan `{url, number}`. GET `/credit/doc?id=` mengunduh PDF privat, GET `/credit/doc/count?id=` mengembalikan `{count}` dokumen global bulan kredit setelah memeriksa akses. Render berulang mengembalikan dokumen yang sama; GET tidak membuat PDF. Admin CGP_READ dan HRD tenant dapat mengunduh sesuai scope detail kredit.

P11: `format=csv` tersedia pada export administrator, perusahaan, debitor, kredit dan review; filter/sort serta scope mengikuti listing dan pagination diabaikan. CSV UTF-8 BOM, nilai yang dapat dibaca sebagai formula spreadsheet diberi awalan apostrof. ZIP di `GET /credit/export-zip` (CGP/scope kredit) dan `GET /credit/review/export-zip` (DKN_READ), memakai filter listing dan hanya dokumen yang tercatat. Arsip kosong valid; key tidak sah atau file hilang menghasilkan 404. ZIP dikirim sebagai attachment `credit-documents.zip`, nama isi mencakup debitor, kredit, perusahaan dan bulan pembuatan. Dokumen berasal dari storage privat, tanpa akses URL eksternal; maksimal lima file dibaca paralel.
