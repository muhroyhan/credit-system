# Happy path dan pengembangan test P13

Sumber kebutuhan: business-flow.md, api-contract.md dan keputusan logic-holes.md.
Nominal contoh sintetis, bukan data produksi. Katalog di akhir dokumen menautkan
setiap deklarasi test/family ke source; data pada `each` dan loop mengembangkan
family tersebut menjadi kasus terpisah atau matriks assertion.

## Dasar klasifikasi

Mengikuti [Lucas Paganini, Static, Unit, Integration, and End-to-End Tests Explained](https://medium.com/@lucas.paganini/static-unit-integration-and-end-to-end-tests-explained-f87a0ac40ca5):
static memeriksa source tanpa menjalankan aplikasi; unit memeriksa perilaku
terisolasi; integration memeriksa kerja sama unit; E2E memeriksa interaksi
pengguna melalui browser. Proyek memakai semua lapisan agar kegagalan lokal
mudah ditemukan sekaligus perjalanan utama terbukti berjalan.

Artikel menjadi dasar klasifikasi. Expected result bisnis berasal dari dokumen
proyek, tidak dihitung dengan memanggil fungsi produksi yang sedang diuji.

## Happy path per fitur

Setiap baris adalah baseline. Kasus negatif di bagian berikut mengubah satu
prasyarat/input dari baseline dan memeriksa penolakan serta tidak adanya partial
write; kasus konkurensi menjalankan dua operasi pada resource yang sama.

| ID baseline | Prasyarat | Langkah | Expected result |
| --- | --- | --- | --- |
| HP-FOUNDATION | Aplikasi tersedia, DB disposable | Buka aplikasi, health dan referensi publik | HTML aplikasi dan health 200; path API/aset tidak dikenal 404; slug hanya DTO publik |
| HP-AUTH | Akun sintetis aktif dan kredensial benar | Login admin/HRD/debitor; akses resource yang diizinkan; logout | Sesi dan DTO tanpa password, resource 200, logout kembali ke login |
| HP-ACL | Admin memiliki satu aksi granular pada program | Gunakan aksi itu pada program terkait | Hanya aksi eksplisit diberikan; aksi/program lain ditolak oleh API dan gate UI |
| HP-ADMIN | Admin writer; program referensi valid | Create, list/filter, detail, update roles, delete | Persisted DTO benar, password tidak bocor, role diganti, record hilang setelah delete |
| HP-COMPANY | Admin writer; badan usaha valid | Create perusahaan, bunga/biaya; baca; update; hapus konfigurasi; delete | Konfigurasi tersimpan sesuai parent, array kosong menghapus child, penghapusan tenant kosong berhasil |
| HP-REGISTRATION | Slug tenant tersedia, username baru | Isi nama, username, password kuat dan konfirmasi sama; daftar/login | Satu akun tenant, login berhasil, menuju profil |
| HP-EMPLOYEE | HRD pemilik atau debitor sendiri | Simpan profil/penghasilan, upload lima dokumen, unduh masing-masing | Date-only dan leading zero tetap; file privat benar; slip dan tanda tangan berbeda |
| HP-CREDIT | Debitor tenant dengan income dan bunga 1%/12 bulan | Simulasikan Rp12 juta, create, detail, edit pending | Angsuran Rp1.120.000, total Rp13.440.000; status pending, child upsert, audit server |
| HP-HRD | HRD tenant pemilik; kredit pending | Putuskan approved atau rejected | Status/audit tersimpan, keputusan dan edit berikutnya terkunci |
| HP-BPR | Admin DKN_APPROVAL; HRD approved; DKN_UPDATE bila data berubah | Approved/rejected/completed | Snapshot hanya pada approved; rejected juga mengubah HRD; completed tidak membutuhkan BPR approved sebelumnya |
| HP-CUSTOMER | Debitor pemilik; dua approval; belum acknowledged | Konfirmasi nama persis dan empat field rekening, consent true; atau batalkan | Rekening/tanggal server tersimpan, atau BPR rejected dengan HRD tetap approved |
| HP-AGREEMENT | Konfirmasi/rekening/identitas lengkap dan bank dikonfigurasi | Generate, ulangi, kunjungi halaman terima kasih, download | Nomor bulanan unik tetap, satu PDF privat A4, retry menggunakan dokumen yang sama |
| HP-EXPORT | Aktor berizin; listing memiliki data/filter | Unduh CSV/PDF/XLSX dan ZIP sesuai filter | Isi/sort/scope sama dengan list tanpa pagination; byte/format valid dan nama attachment benar |
| HP-DASHBOARD | Aktor login; data dua tenant/status | Buka dashboard | Nominal menurut status HRD/scope; active/inactive global tanpa blocked; debitor memiliki totalDebitor nol |

## Pengembangan kasus dari baseline

| Family | Variasi dan batas yang diotomatisasi | Bukti utama |
| --- | --- | --- |
| FOUNDATION-U/I/E | Guard host lokal/nama DB test; nullable DTO; health; fallback API/aset; unknown browser page; pagination 1/100 vs 0/101, pecahan dan NaN; query kosong | database-guard, listing-contracts, reference, health, shell |
| AUTH-U/I/E | Tiga aktor; field kosong; tenant tanpa slug; token forged/salah key/expired/expiry tepat sekarang; claim id/type/slug/exp invalid; resolver revoked/teknis gagal; role dihapus setelah login; akun dinonaktifkan; password salah; tenant salah; retry login; reload/logout | auth, permissions, cruda, reference dan integration/http/auth |
| API-I | Seluruh 46 route privat: anonymous/forged dengan body malformed ditolak 401 sebelum validasi; 17 route JSON × empat body invalid; lima prefix detail/list × invalid ID/query; absent record 404; export xml 400 | api-boundaries |
| ADMIN-U/I/E | Password create wajib/update opsional, panjang 8–72; email/username invalid; lima aksi granular vs WRITE; role duplicate/missing program; konflik username/email; role replace/empty; missing update/delete/detail; filter/sort, read-only/direct URL; konflik UI tetap menyimpan input | admin-users dan integration/http/admin-users |
| COMPANY-U/I/E | Active/inactive/blocked; format slug; bunga nol/pecahan/negatif/NaN/Infinity; tenor positif/zero/pecahan; biaya 0/INT_MAX vs negatif/overflow; missing entity; konflik username/email/slug/nama+entity; foreign/repeated child ID; SQL child gagal rollback; empty arrays; guard delete tenant dengan debitor | companies dan integration/http/companies |
| REGISTRATION-U/I/E | Password uppercase/lowercase/digit/panjang; konfirmasi berbeda; username invalid; field internal ditolak; slug tidak ada; username duplikat/bersamaan; form invalid tidak POST | registration, employees dan integration/http/employees |
| EMPLOYEE-U/I/E | Setiap field profil wajib; tanggal tidak mungkin; income 0/UINT_MAX vs overflow/pecahan/negatif; zero telepon/NIK/rekening; PDF/PNG/JPG/JPEG signature/MIME/extension, tepat 10 MB vs lebih/empty; setiap dokumen wajib hilang; NPWP opsional; replace tunggal; upload gagal membersihkan file baru dan mempertahankan lama; tenant/self scope; dua profile save; SQL rollback; enam child terhapus | employees, employees-boundaries dan integration/http/employees |
| CREDIT-U/I/E | Digit/format ribuan/whitespace; 0/negatif/pecahan/komma/eksponen/unsafe integer; Rp7.999.999 vs Rp8 juta; tenor 0/negatif/pecahan/tidak tersedia; bunga 0/0,75/invalid; rounding dan overflow; income/open sum invalid; score negatif tetap informatif; field approval/biaya ditolak; lima child writable update ID tetap; tenant/query override; SQL rollback/edit lock/delete employee guard | credit, credit-children, credit-scope |
| HRD-U/I/E | Kedua keputusan valid; pending/completed/mixed fields ditolak pada input; approved/rejected/completed/null sebagai status lama ditolak; HRD tenant lain/admin/debitor ditolak; missing ID; keputusan ulang dan keputusan bersamaan satu winner | credit-approval, credit-approval-matrix |
| BPR-U/I/E | %, x, fixed, pecahan sen; tabungan case-insensitive; stamp/tabungan tetap; empty config; snapshot decimal invalid; insurance negatif/NaN/Infinity/>2 desimal; SQL DECIMAL overflow; HRD nonapproved/null; tiga keputusan; repeat; approved ke completed snapshot sama; status terminal lock; UPDATE terpisah dari APPROVAL; transport sukses/503/throw tidak mengubah keputusan | credit-review, credit-review-transitions, credit-notification |
| CUSTOMER-U/I/E | 25 kombinasi HRD/BPR dari pending/approved/rejected/completed/null: 24 tidak valid menolak confirm dan cancel tanpa perubahan; aktor salah; nama berbeda/case/spasi; empat rekening kosong; consent false/string/hilang; field tanggal/status server ditolak; server CURRENT_DATE dan audit; leading zero; confirm ulang/cancel ulang; race confirm vs cancel | credit-customer, credit-customer-matrix |
| AGREEMENT-U/I/E | Leap year, end-of-month, year rollover, 0/1200 bulan vs -1/pecahan/1201/overflow; terbilang nol/ribu/juta/miliar/triliun/negatif/quadrillion; setiap prasyarat nomor hilang; aktor salah; nomor konkuren tetap; bank config hilang/render gagal/storage gagal rollback; parallel retry satu file; download tidak menerbitkan; tenant salah; PDF A4/pasal/surat | agreement, agreement-preconditions, pdf-document |
| EXPORT-U/I/E | Header MIME/filename; CSV quote/comma/newline/BOM/CRLF/formula + - = @ termasuk whitespace; empty CSV; XLSX Unicode/leading zero/formula sebagai string; PDF multipage/header ulang; query tidak dimutasi; ZIP parse isi/nama/byte, kosong, key asing/traversal/URL, file hilang, storage throw, sanitasi nama dan lima read paralel; tenant/filter/unlimited export | export-query, search-params, export-file, zip-documents, export |
| DASHBOARD-U/I/E | Empty/missing status, rejected/null diabaikan; nominal melebihi integer JS tepat; global active/inactive tanpa blocked; dua tenant dan tiga aktor; HRD approved dengan BPR rejected tetap dihitung; anonymous 401 | dashboard |

Matriks ini mendeskripsikan domain berbatas yang diuji, bukan klaim semua input
tak terbatas atau semua urutan konkurensi. Detail batas dan risiko ada pada
[qa-analysis.md](qa-analysis.md) dan [logic-holes.md](logic-holes.md).

## Katalog deklarasi test

U = unit, I = integration modul/SQL, H = integration HTTP native, E = browser.
Judul dengan placeholder mewakili seluruh dataset `each`/loop pada tautan source.
Katalog mencakup test lama yang dipertahankan serta tambahan P13.

| Layer | Test/family | Source |
| --- | --- | --- |
| E | ADMIN-E duplicate account shows a conflict and retains entered data | [admin-users.spec.ts:6](../../tests/e2e/admin-users.spec.ts#L6) |
| E | admin interface adds and finds a user | [admin-users.spec.ts:30](../../tests/e2e/admin-users.spec.ts#L30) |
| E | read-only admin can inspect but cannot edit | [admin-users.spec.ts:104](../../tests/e2e/admin-users.spec.ts#L104) |
| E | protected feature URLs redirect anonymous visitors to login | [admin-users.spec.ts:129](../../tests/e2e/admin-users.spec.ts#L129) |
| E | confirmed customer creates, revisits and downloads a private agreement | [agreement.spec.ts:9](../../tests/e2e/agreement.spec.ts#L9) |
| E | admin can sign in and sign out | [auth.spec.ts:4](../../tests/e2e/auth.spec.ts#L4) |
| E | AUTH-E wrong credentials show a real server error and allow retry | [auth.spec.ts:14](../../tests/e2e/auth.spec.ts#L14) |
| E | AUTH-E reload ends the in-memory session and redirects to login | [auth.spec.ts:34](../../tests/e2e/auth.spec.ts#L34) |
| E | tenant actors can sign in | [auth.spec.ts:52](../../tests/e2e/auth.spec.ts#L52) |
| E | AUTH-E unknown browser path displays the not-found page | [auth.spec.ts:71](../../tests/e2e/auth.spec.ts#L71) |
| E | company forms validate, reconcile arrays and display text detail | [companies.spec.ts:4](../../tests/e2e/companies.spec.ts#L4) |
| E | HRD approves and rejects while other actors cannot decide | [credit-approval.spec.ts:9](../../tests/e2e/credit-approval.spec.ts#L9) |
| E | customer confirms an approved credit and cancels another | [credit-customer.spec.ts:8](../../tests/e2e/credit-customer.spec.ts#L8) |
| E | BPR can approve, reject and complete HRD-approved applications | [credit-review.spec.ts:9](../../tests/e2e/credit-review.spec.ts#L9) |
| E | HRD simulates, submits, filters and edits a pending application | [credit.spec.ts:10](../../tests/e2e/credit.spec.ts#L10) |
| E | dashboard shows scoped totals and rejects anonymous requests | [dashboard.spec.ts:8](../../tests/e2e/dashboard.spec.ts#L8) |
| E | nasabah registers, logs in, validates profile and uploads five distinct documents | [employees.spec.ts:11](../../tests/e2e/employees.spec.ts#L11) |
| E | HRD creates and deletes a scoped employee through standard pages | [employees.spec.ts:177](../../tests/e2e/employees.spec.ts#L177) |
| E | employee pages reject direct anonymous URLs | [employees.spec.ts:230](../../tests/e2e/employees.spec.ts#L230) |
| E | CSV and ZIP respect filters and tenant access | [export.spec.ts:9](../../tests/e2e/export.spec.ts#L9) |
| E | listing filters omit cleared values from requests | [listing-queries.spec.ts:4](../../tests/e2e/listing-queries.spec.ts#L4) |
| E | REGISTRATION-E mismatching passwords stay on the form without sending registration | [registration.spec.ts:3](../../tests/e2e/registration.spec.ts#L3) |
| E | serves the app and API | [shell.spec.ts:3](../../tests/e2e/shell.spec.ts#L3) |
| I | creates, lists and reads a public DTO with roles | [admin-users.test.ts:35](../../tests/integration/admin-users.test.ts#L35) |
| I | rejects conflicting %s | [admin-users.test.ts:49](../../tests/integration/admin-users.test.ts#L49) |
| I | rejects nonexistent programs and retains prior account and roles | [admin-users.test.ts:59](../../tests/integration/admin-users.test.ts#L59) |
| I | replaces role configuration and removes all roles with an empty array | [admin-users.test.ts:76](../../tests/integration/admin-users.test.ts#L76) |
| I | deletes account and roles and reports a second delete as absent | [admin-users.test.ts:90](../../tests/integration/admin-users.test.ts#L90) |
| I | rejects updates to absent accounts | [admin-users.test.ts:97](../../tests/integration/admin-users.test.ts#L97) |
| I | rejects missing %s without consuming a number | [agreement-preconditions.test.ts:25](../../tests/integration/agreement-preconditions.test.ts#L25) |
| I | denies issuance by %s | [agreement-preconditions.test.ts:48](../../tests/integration/agreement-preconditions.test.ts#L48) |
| I | does not reserve a number or write a file without bank configuration | [agreement-preconditions.test.ts:59](../../tests/integration/agreement-preconditions.test.ts#L59) |
| I | rolls back the number when PDF rendering fails | [agreement-preconditions.test.ts:78](../../tests/integration/agreement-preconditions.test.ts#L78) |
| I | does not generate a PDF during download | [agreement-preconditions.test.ts:97](../../tests/integration/agreement-preconditions.test.ts#L97) |
| I | locks monthly numbers across credits and preserves numbers on retry | [agreement.test.ts:29](../../tests/integration/agreement.test.ts#L29) |
| I | rolls back failed storage and reuses a real PDF on concurrent retries | [agreement.test.ts:81](../../tests/integration/agreement.test.ts#L81) |
| I | %s %s rejects anonymous and forged requests | [api-boundaries.test.ts:54](../../tests/integration/api-boundaries.test.ts#L54) |
| I | %s %s rejects malformed JSON and wrong shape | [api-boundaries.test.ts:71](../../tests/integration/api-boundaries.test.ts#L71) |
| I | %s rejects invalid detail IDs and unsafe list queries | [api-boundaries.test.ts:99](../../tests/integration/api-boundaries.test.ts#L99) |
| I | %s rejects unsupported file format | [api-boundaries.test.ts:134](../../tests/integration/api-boundaries.test.ts#L134) |
| I | sets insert defaults and only auto-updates updated_at | [audit-timestamps.test.ts:7](../../tests/integration/audit-timestamps.test.ts#L7) |
| I | preserves created_at and updates updated_at through SQL and Drizzle | [audit-timestamps.test.ts:34](../../tests/integration/audit-timestamps.test.ts#L34) |
| I | creates configuration, filters listing and omits password | [companies.test.ts:36](../../tests/integration/companies.test.ts#L36) |
| I | rejects duplicate %s | [companies.test.ts:55](../../tests/integration/companies.test.ts#L55) |
| I | rejects duplicate company name and entity pair | [companies.test.ts:65](../../tests/integration/companies.test.ts#L65) |
| I | rejects a missing entity before creating parent or children | [companies.test.ts:75](../../tests/integration/companies.test.ts#L75) |
| I | rejects foreign child IDs without partial parent updates | [companies.test.ts:80](../../tests/integration/companies.test.ts#L80) |
| I | rejects repeated child IDs and retains the full configuration | [companies.test.ts:105](../../tests/integration/companies.test.ts#L105) |
| I | rolls back parent and child replacement after a SQL failure | [companies.test.ts:127](../../tests/integration/companies.test.ts#L127) |
| I | reconciles empty arrays by deleting all configuration | [companies.test.ts:144](../../tests/integration/companies.test.ts#L144) |
| I | refuses deletion of a seeded tenant with employees | [companies.test.ts:157](../../tests/integration/companies.test.ts#L157) |
| I | returns absent on missing delete/detail and rejects missing update | [companies.test.ts:162](../../tests/integration/companies.test.ts#L162) |
| I | rejects an HRD decision when current status is %s | [credit-approval-matrix.test.ts:12](../../tests/integration/credit-approval-matrix.test.ts#L12) |
| I | returns not found for a missing application | [credit-approval-matrix.test.ts:28](../../tests/integration/credit-approval-matrix.test.ts#L28) |
| I | applies and locks ${status} only for the owning HRD | [credit-approval.test.ts:44](../../tests/integration/credit-approval.test.ts#L44) |
| I | serializes simultaneous competing decisions | [credit-approval.test.ts:72](../../tests/integration/credit-approval.test.ts#L72) |
| I | inserts then updates %s while keeping its row ID | [credit-children.test.ts:7](../../tests/integration/credit-children.test.ts#L7) |
| I | rejects confirm and cancel for HRD=$status BPR=$statusAdminApproval | [credit-customer-matrix.test.ts:36](../../tests/integration/credit-customer-matrix.test.ts#L36) |
| I | denies %s before writing customer confirmation | [credit-customer-matrix.test.ts:56](../../tests/integration/credit-customer-matrix.test.ts#L56) |
| I | rejects %s name without saving account fields | [credit-customer-matrix.test.ts:74](../../tests/integration/credit-customer-matrix.test.ts#L74) |
| I | stores the SQL server date, account zeroes and actor audit | [credit-customer-matrix.test.ts:99](../../tests/integration/credit-customer-matrix.test.ts#L99) |
| I | serializes confirmation against cancellation with one committed outcome | [credit-customer-matrix.test.ts:124](../../tests/integration/credit-customer-matrix.test.ts#L124) |
| I | requires ownership, approvals and exact name, and prevents repeated writes | [credit-customer.test.ts:32](../../tests/integration/credit-customer.test.ts#L32) |
| I | cancels without changing HRD approval | [credit-customer.test.ts:88](../../tests/integration/credit-customer.test.ts#L88) |
| I | keeps approval and one snapshot after %s | [credit-notification.test.ts:15](../../tests/integration/credit-notification.test.ts#L15) |
| I | rejects BPR review when HRD is %s | [credit-review-transitions.test.ts:12](../../tests/integration/credit-review-transitions.test.ts#L12) |
| I | allows approved to completed while preserving a single expense snapshot | [credit-review-transitions.test.ts:31](../../tests/integration/credit-review-transitions.test.ts#L31) |
| I | requires update permission for changes in addition to approval | [credit-review-transitions.test.ts:57](../../tests/integration/credit-review-transitions.test.ts#L57) |
| I | locks BPR status %s | [credit-review-transitions.test.ts:81](../../tests/integration/credit-review-transitions.test.ts#L81) |
| I | saves ${status} and enforces actor and repeat rules | [credit-review.test.ts:37](../../tests/integration/credit-review.test.ts#L37) |
| I | never allows %s query filters to override tenant scope | [credit-scope.test.ts:12](../../tests/integration/credit-scope.test.ts#L12) |
| I | denies %s detail and mutation of another tenant | [credit-scope.test.ts:32](../../tests/integration/credit-scope.test.ts#L32) |
| I | returns empty results for unmatched filters and not found for missing detail | [credit-scope.test.ts:45](../../tests/integration/credit-scope.test.ts#L45) |
| I | denies an administrator without the exact CGP action | [credit-scope.test.ts:55](../../tests/integration/credit-scope.test.ts#L55) |
| I | creates, updates child, guards deletion and locks approved applications | [credit.test.ts:27](../../tests/integration/credit.test.ts#L27) |
| I | applies actor scopes and HRD status to exact nominal totals | [dashboard.test.ts:33](../../tests/integration/dashboard.test.ts#L33) |
| I | STORAGE-I persists bytes, prevents overwrite and removes missing files idempotently | [document-storage.test.ts:7](../../tests/integration/document-storage.test.ts#L7) |
| I | saves profile data without exposing password or losing string zeroes | [employees-boundaries.test.ts:24](../../tests/integration/employees-boundaries.test.ts#L24) |
| I | upserts concurrent profiles into one row per child table | [employees-boundaries.test.ts:32](../../tests/integration/employees-boundaries.test.ts#L32) |
| I | rolls back parent changes after a child SQL failure | [employees-boundaries.test.ts:46](../../tests/integration/employees-boundaries.test.ts#L46) |
| I | denies profile and document writes from %s | [employees-boundaries.test.ts:61](../../tests/integration/employees-boundaries.test.ts#L61) |
| I | requires first-time document %s before persisting any files | [employees-boundaries.test.ts:75](../../tests/integration/employees-boundaries.test.ts#L75) |
| I | replaces one document, deletes the old file and preserves other documents | [employees-boundaries.test.ts:89](../../tests/integration/employees-boundaries.test.ts#L89) |
| I | returns not found for a document that is not stored | [employees-boundaries.test.ts:108](../../tests/integration/employees-boundaries.test.ts#L108) |
| I | serializes duplicate account creation into one success and one conflict | [employees.test.ts:34](../../tests/integration/employees.test.ts#L34) |
| I | compensates failed replacement uploads and preserves existing files and SQL keys | [employees.test.ts:59](../../tests/integration/employees.test.ts#L59) |
| I | rejects query filters that attempt to override the HRD tenant | [employees.test.ts:98](../../tests/integration/employees.test.ts#L98) |
| I | removes all six child types when deleting an employee | [employees.test.ts:107](../../tests/integration/employees.test.ts#L107) |
| I | round-trips XLSX cells, Unicode and leading zeroes | [export-file.test.ts:6](../../tests/integration/export-file.test.ts#L6) |
| I | renders every row across PDF pages with repeated headers | [export-file.test.ts:25](../../tests/integration/export-file.test.ts#L25) |
| I | serves health over the app boundary | [health.test.ts:4](../../tests/integration/health.test.ts#L4) |
| H | admin CRUD, role checks and conflicts | [admin-users.spec.ts:5](../../tests/integration/http/admin-users.spec.ts#L5) |
| H | individual ACL values apply independently | [admin-users.spec.ts:169](../../tests/integration/http/admin-users.spec.ts#L169) |
| H | AUTH-I rejects expired and invalid-claim tokens through Bun middleware | [auth.spec.ts:8](../../tests/integration/http/auth.spec.ts#L8) |
| H | AUTH-I current roles and inactive accounts invalidate existing access | [auth.spec.ts:27](../../tests/integration/http/auth.spec.ts#L27) |
| H | login succeeds for each actor and protects references | [auth.spec.ts:101](../../tests/integration/http/auth.spec.ts#L101) |
| H | company API permissions, tenant scope and deletion guard | [companies.spec.ts:5](../../tests/integration/http/companies.spec.ts#L5) |
| H | registration API rejects internal fields and isolates employee CRUD and document download | [employees.spec.ts:14](../../tests/integration/http/employees.spec.ts#L14) |
| I | renders supplied document sections as an A4 PDF | [pdf-document.test.ts:4](../../tests/integration/pdf-document.test.ts#L4) |
| I | blocks all private routes even with untrusted authorization header | [reference.test.ts:8](../../tests/integration/reference.test.ts#L8) |
| I | reuses the pool across repository calls | [reference.test.ts:16](../../tests/integration/reference.test.ts#L16) |
| I | returns seeded data through routes and filters constants | [reference.test.ts:23](../../tests/integration/reference.test.ts#L23) |
| U | accepts create and password-free update with granular permissions | [admin-users.test.ts:19](../../tests/unit/admin-users.test.ts#L19) |
| U | accepts explicit %s | [admin-users.test.ts:27](../../tests/unit/admin-users.test.ts#L27) |
| U | rejects invalid create %j | [admin-users.test.ts:35](../../tests/unit/admin-users.test.ts#L35) |
| U | allows distinct actions on the same program | [admin-users.test.ts:56](../../tests/unit/admin-users.test.ts#L56) |
| U | supplies deterministic listing defaults | [admin-users.test.ts:67](../../tests/unit/admin-users.test.ts#L67) |
| U | rejects invalid listing %j | [admin-users.test.ts:78](../../tests/unit/admin-users.test.ts#L78) |
| U | adds calendar months with end-of-month and leap-year clamping | [agreement.test.ts:8](../../tests/unit/agreement.test.ts#L8) |
| U | spells whole rupiah without floating point rounding | [agreement.test.ts:15](../../tests/unit/agreement.test.ts#L15) |
| U | adds %s by %s calendar months | [agreement.test.ts:28](../../tests/unit/agreement.test.ts#L28) |
| U | rejects date/month outside supported domain %s/%s | [agreement.test.ts:37](../../tests/unit/agreement.test.ts#L37) |
| U | spells %s without floating point conversion | [agreement.test.ts:50](../../tests/unit/agreement.test.ts#L50) |
| U | rejects wording overflow at one quadrillion | [agreement.test.ts:64](../../tests/unit/agreement.test.ts#L64) |
| U | accepts a complete %s login | [auth.test.ts:16](../../tests/unit/auth.test.ts#L16) |
| U | rejects invalid login %j | [auth.test.ts:29](../../tests/unit/auth.test.ts#L29) |
| U | resolves current identity for a valid signature | [auth.test.ts:53](../../tests/unit/auth.test.ts#L53) |
| U | rejects malformed authorization %s before resolving SQL identity | [auth.test.ts:61](../../tests/unit/auth.test.ts#L61) |
| U | rejects invalid or expired claims %j | [auth.test.ts:70](../../tests/unit/auth.test.ts#L70) |
| U | rejects signatures from another key | [auth.test.ts:85](../../tests/unit/auth.test.ts#L85) |
| U | rejects a revoked identity even with a valid token | [auth.test.ts:96](../../tests/unit/auth.test.ts#L96) |
| U | propagates configuration and repository failures | [auth.test.ts:103](../../tests/unit/auth.test.ts#L103) |
| U | validates percentage/tenor and preserves fractional interest | [companies.test.ts:11](../../tests/unit/companies.test.ts#L11) |
| U | requires create password and accepts empty configuration | [companies.test.ts:25](../../tests/unit/companies.test.ts#L25) |
| U | accepts %s company | [companies.test.ts:53](../../tests/unit/companies.test.ts#L53) |
| U | rejects invalid company %j | [companies.test.ts:58](../../tests/unit/companies.test.ts#L58) |
| U | validates interest %s and tenor %s | [companies.test.ts:75](../../tests/unit/companies.test.ts#L75) |
| U | accepts expense integer boundary %s | [companies.test.ts:93](../../tests/unit/companies.test.ts#L93) |
| U | rejects expense value %s | [companies.test.ts:99](../../tests/unit/companies.test.ts#L99) |
| U | rejects listing %j | [companies.test.ts:111](../../tests/unit/companies.test.ts#L111) |
| U | accepts only the two decisions and no unrelated fields | [credit-approval.test.ts:5](../../tests/unit/credit-approval.test.ts#L5) |
| U | accepts consent and preserves leading zeroes | [credit-customer.test.ts:15](../../tests/unit/credit-customer.test.ts#L15) |
| U | trims account fields without normalizing the exact confirmation name | [credit-customer.test.ts:18](../../tests/unit/credit-customer.test.ts#L18) |
| U | requires %s | [credit-customer.test.ts:27](../../tests/unit/credit-customer.test.ts#L27) |
| U | rejects invalid or server-owned field %j | [credit-customer.test.ts:39](../../tests/unit/credit-customer.test.ts#L39) |
| U | keeps fractional rupiah and the fixed stamp and savings rules | [credit-review.test.ts:7](../../tests/unit/credit-review.test.ts#L7) |
| U | retains fixed stamp and savings without configured expenses | [credit-review.test.ts:29](../../tests/unit/credit-review.test.ts#L29) |
| U | excludes savings case-insensitively and retains negative net proceeds | [credit-review.test.ts:34](../../tests/unit/credit-review.test.ts#L34) |
| U | rejects incomplete configuration %j | [credit-review.test.ts:42](../../tests/unit/credit-review.test.ts#L42) |
| U | rejects invalid insurance %s | [credit-review.test.ts:53](../../tests/unit/credit-review.test.ts#L53) |
| U | rejects malformed snapshot %s | [credit-review.test.ts:61](../../tests/unit/credit-review.test.ts#L61) |
| U | rejects decimal storage overflow | [credit-review.test.ts:71](../../tests/unit/credit-review.test.ts#L71) |
| U | accepts BPR %s input | [credit-review.test.ts:81](../../tests/unit/credit-review.test.ts#L81) |
| U | calculates the independently specified flat interest example | [credit.test.ts:12](../../tests/unit/credit.test.ts#L12) |
| U | checks boundaries, zero and unavailable tenor | [credit.test.ts:23](../../tests/unit/credit.test.ts#L23) |
| U | rejects approval and cost fields from the applicant | [credit.test.ts:39](../../tests/unit/credit.test.ts#L39) |
| U | normalizes equivalent nominal %s | [credit.test.ts:62](../../tests/unit/credit.test.ts#L62) |
| U | rejects invalid nominal %s | [credit.test.ts:68](../../tests/unit/credit.test.ts#L68) |
| U | rejects invalid months %s | [credit.test.ts:83](../../tests/unit/credit.test.ts#L83) |
| U | calculates zero and fractional monthly rates independently | [credit.test.ts:91](../../tests/unit/credit.test.ts#L91) |
| U | rejects unusable rate %s | [credit.test.ts:103](../../tests/unit/credit.test.ts#L103) |
| U | rejects missing configuration and unsafe arithmetic | [credit.test.ts:113](../../tests/unit/credit.test.ts#L113) |
| U | keeps score informational, including zero and negative values | [credit.test.ts:124](../../tests/unit/credit.test.ts#L124) |
| U | rejects invalid income %s | [credit.test.ts:131](../../tests/unit/credit.test.ts#L131) |
| U | allows only explicitly granted permissions | [cruda.test.ts:11](../../tests/unit/cruda.test.ts#L11) |
| U | respects individual actions and explicit approval | [cruda.test.ts:34](../../tests/unit/cruda.test.ts#L34) |
| U | denies other programs, tenant actors and malformed roles | [cruda.test.ts:51](../../tests/unit/cruda.test.ts#L51) |
| U | fills missing statuses with zero and preserves precise nominal sums | [dashboard.test.ts:4](../../tests/unit/dashboard.test.ts#L4) |
| U | returns zero totals for an empty dataset | [dashboard.test.ts:15](../../tests/unit/dashboard.test.ts#L15) |
| U | maps each HRD status and ignores unsupported/null rows | [dashboard.test.ts:22](../../tests/unit/dashboard.test.ts#L22) |
| U | accepts local test host %s | [database-guard.test.ts:5](../../tests/unit/database-guard.test.ts#L5) |
| U | rejects non-disposable target %s | [database-guard.test.ts:12](../../tests/unit/database-guard.test.ts#L12) |
| U | rejects internal registration fields and validates passwords repeatedly without regex state | [employees.test.ts:13](../../tests/unit/employees.test.ts#L13) |
| U | preserves telephone leading zeroes and calendar dates, rejects impossible dates and income overflow | [employees.test.ts:35](../../tests/unit/employees.test.ts#L35) |
| U | checks file signature rather than trusting extension or MIME | [employees.test.ts:49](../../tests/unit/employees.test.ts#L49) |
| U | grants company CRUD and debitor self read/update only for CGP | [employees.test.ts:74](../../tests/unit/employees.test.ts#L74) |
| U | accepts a complete profile and unsigned income boundaries | [employees.test.ts:95](../../tests/unit/employees.test.ts#L95) |
| U | rejects missing required profile %s | [employees.test.ts:103](../../tests/unit/employees.test.ts#L103) |
| U | rejects income %s | [employees.test.ts:126](../../tests/unit/employees.test.ts#L126) |
| U | accepts matching signature for %s | [employees.test.ts:134](../../tests/unit/employees.test.ts#L134) |
| U | accepts exactly 10 MB and rejects mismatched MIME and extension | [employees.test.ts:151](../../tests/unit/employees.test.ts#L151) |
| U | rejects untrusted stored document key %s | [employees.test.ts:170](../../tests/unit/employees.test.ts#L170) |
| U | accepts service-generated private document keys | [employees.test.ts:179](../../tests/unit/employees.test.ts#L179) |
| U | preserves the %s binary response and attachment name | [export-file.test.ts:5](../../tests/unit/export-file.test.ts#L5) |
| U | neutralizes spreadsheet formula %s | [export-file.test.ts:29](../../tests/unit/export-file.test.ts#L29) |
| U | writes a BOM, CRLF records and headers for an empty CSV | [export-file.test.ts:46](../../tests/unit/export-file.test.ts#L46) |
| U | escapes CSV fields and spreadsheet formulas without truncation | [export-file.test.ts:57](../../tests/unit/export-file.test.ts#L57) |
| U | parses the format together with listing filters | [export-query.test.ts:7](../../tests/unit/export-query.test.ts#L7) |
| U | rejects missing and unsupported formats | [export-query.test.ts:15](../../tests/unit/export-query.test.ts#L15) |
| U | defaults to page one, twenty records and descending creation time | [listing-contracts.test.ts:15](../../tests/unit/listing-contracts.test.ts#L15) |
| U | accepts inclusive page-size boundary %s | [listing-contracts.test.ts:23](../../tests/unit/listing-contracts.test.ts#L23) |
| U | rejects invalid pagination or direction %j | [listing-contracts.test.ts:29](../../tests/unit/listing-contracts.test.ts#L29) |
| U | retains exact program checks | [permissions.test.ts:19](../../tests/unit/permissions.test.ts#L19) |
| U | scopes non-admin identities to their tenant | [permissions.test.ts:23](../../tests/unit/permissions.test.ts#L23) |
| U | granting %s grants no other action or program | [permissions.test.ts:38](../../tests/unit/permissions.test.ts#L38) |
| U | checks each action and requires explicit approval | [permissions.test.ts:57](../../tests/unit/permissions.test.ts#L57) |
| U | maps public slugs and validates query | [reference.test.ts:10](../../tests/unit/reference.test.ts#L10) |
| U | REFERENCE-U preserves nullable legacy values while stripping internal columns | [reference.test.ts:22](../../tests/unit/reference.test.ts#L22) |
| U | accepts matching strong credentials | [registration.test.ts:12](../../tests/unit/registration.test.ts#L12) |
| U | rejects mismatching confirmation %s | [registration.test.ts:15](../../tests/unit/registration.test.ts#L15) |
| U | rejects a password outside registration rules %s | [registration.test.ts:32](../../tests/unit/registration.test.ts#L32) |
| U | exports the same filters without mutating the listing parameters | [search-params.test.ts:5](../../tests/unit/search-params.test.ts#L5) |
| U | omits absent and cleared filters while keeping defined values | [search-params.test.ts:21](../../tests/unit/search-params.test.ts#L21) |
| U | contains exact filenames and original bytes | [zip-documents.test.ts:22](../../tests/unit/zip-documents.test.ts#L22) |
| U | returns a parseable empty archive without reading storage | [zip-documents.test.ts:32](../../tests/unit/zip-documents.test.ts#L32) |
| U | reads at most five files concurrently across batches | [zip-documents.test.ts:39](../../tests/unit/zip-documents.test.ts#L39) |
| U | rejects untrusted or foreign private key %s without a read | [zip-documents.test.ts:61](../../tests/unit/zip-documents.test.ts#L61) |
| U | fails the archive when an expected file is missing | [zip-documents.test.ts:74](../../tests/unit/zip-documents.test.ts#L74) |
| U | propagates storage errors | [zip-documents.test.ts:79](../../tests/unit/zip-documents.test.ts#L79) |
| U | sanitizes company names and substitutes missing identities | [zip-documents.test.ts:88](../../tests/unit/zip-documents.test.ts#L88) |

Jumlah deklarasi/family: 200. Jumlah kasus saat runner mengekspansi dataset
dicatat terpisah pada testing.md.
