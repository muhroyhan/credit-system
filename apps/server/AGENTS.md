# Backend

Urutan akses sekaligus import: global routes → feature routes → controller → service → repository. Global routes menggabungkan feature.routes.ts; route fitur mengimpor controller dan middleware; controller mengimpor service; hanya service yang mengimpor repository. Type/kontrak bersama merupakan dependency tersendiri. Test boleh mengimpor unit yang sedang diuji.

Pengajuan kredit dan review BPR memakai fitur terpisah. Service review boleh memakai repository kredit untuk query bersama; route review digabung dalam prefix kredit agar kontrak URL tetap sama.

- app.ts hanya memasang /api sekali dan mengekspor AppType. Definisikan method/path pada feature.routes.ts, controller hanya handler. Gunakan const app = new Hono() dan pemanggilan method terpisah, bukan chaining panjang; pasang satu prefix fitur dan tulis path endpoint sekali bersama middleware/handler.
- Urutan request: autentikasi, izin/scope yang diperlukan, validasi Zod, service, respons. Route publik tetap publik. JSON malformed menjadi input invalid; kegagalan internal tidak disamarkan sebagai validasi.
- Controller menerima request dan mengirim respons. Gunakan input untuk body tervalidasi, query untuk filter dan result untuk hasil service. Detail bentuk respons/status hanya di [api-contract.md](../../docs/credit-system/api-contract.md).
- Service berisi aturan bisnis dan satu-satunya tempat throw error bisnis. Satu service boleh memakai banyak repository. Service non-GET membuka satu withTransaction dan meneruskan transaksi yang sama ke seluruh operasi DB; error harus keluar dari callback agar rollback. Pekerjaan non-DB dapat dilakukan sebelum transaksi.
- Repository hanya query dan mapping data dengan interface bertipe di feature.type.ts. Terima transaksi service untuk penulisan; jangan membuka transaksi sendiri atau membuat error bisnis. Error teknis driver diteruskan. Kembalikan DTO konkret/null/boolean/ID, bukan unknown; pilih kolom publik secara eksplisit dan jangan sertakan hash password.
- Untuk pembacaan tanpa transaksi ambil const db = connectDatabase().db sekali per fungsi. Jangan menutup pool per repository; tutup hanya saat aplikasi/runner mandiri berakhir. Audit dan updatedAt berasal server.
- Middleware hanya dibuat ketika dipakai, diimpor route fitur dan mengakses aturan bisnis melalui service. Bungkus middleware bawaan di folder middleware yang sama. ACL berupa PROGRAM_ACTION melalui permission(...); daftar aksi dan mapping program hanya di kontrak API.
- Pertahankan tipe Hono RPC saat route digabung. Tipe AppType boleh diimpor frontend dengan import type; jangan memasukkan kode server atau kredensial ke bundle browser.
- Ekspor PDF/XLSX dibentuk di server memakai utils/export-file.ts. Service menyiapkan kolom/data, memakai repository listing yang sama tanpa pagination atau batas jumlah data, menerapkan filter/sort/scope. Frontend hanya mengunduh hasil.

Rujuk [kontrak API](../../docs/credit-system/api-contract.md) dan [model data](../../docs/credit-system/data-model.md) untuk perubahan terkait.
