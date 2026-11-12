# Standar kode API

Berlaku untuk semua fitur backend. Aturan ini melengkapi [architecture.md](architecture.md), [api-contract.md](api-contract.md) dan instruksi direktori server. Kesamaan gaya tidak boleh mengubah aturan bisnis atau bentuk response tanpa pencatatan kompatibilitas.

## Temuan dan penyeragaman

| Area | Perbedaan yang ditemukan | Standar |
| --- | --- | --- |
| Akses database | Reference memanggil `connectDatabase().db.select`, admin/auth menyimpan `db` | Setiap fungsi repository mengambil `const db = connectDatabase().db` satu kali, lalu memakai `db` |
| Pembuatan route | Reference factory; admin/auth instance singleton dengan dependency internal | `create<Feature>Routes(dependency)` membuat app dan service; composition root memasok implementasi data |
| Hasil repository | Interface reference/admin memakai `Promise<unknown>` | Gunakan DTO konkret dari contracts; null menandakan detail tidak ditemukan, bukan `unknown` |
| Validasi ID | Admin menulis Zod ID langsung di route | Schema request/query di contracts, termasuk `idQuerySchema` |
| Tipe RPC | `SchemaOf` didefinisikan ulang pada beberapa file | Gunakan helper bersama dari infrastructure; schema semua route ikut dalam `AppType` |
| Error | Login invalid credentials, admin conflict/not found, reference invalid query | Bentuk `{error: string}`; pesan tetap sesuai konteks, status HTTP konsisten |
| Autentikasi | Middleware dan pembatasan program memiliki kebutuhan berbeda | Middleware identitas pada route privat; izin program hanya pada endpoint yang memang membutuhkannya |

## Repository dan database

```ts
async function listSomething() {
  const db = connectDatabase().db;
  return db.select({ id: table.id }).from(table);
}
```

- Koneksi diambil di dalam fungsi, bukan saat module diimpor, agar konfigurasi dimuat sebelum dipakai. `connectDatabase` mengembalikan pool bersama; repository tidak menutup pool.
- Gunakan proyeksi kolom eksplisit untuk response publik. Hash password hanya dipilih untuk use case internal autentikasi, tidak dimasukkan ke DTO.
- Query, mapping persistence, dan transaksi berada di data. Kalkulasi, kebijakan akses, dan aturan bisnis berada di application. Application bergantung pada interface, bukan implementasi repository.
- Operasi induk/child yang harus konsisten memakai `db.transaction`; seluruh query di callback menggunakan `tx`, bukan `db` di luar transaksi.
- Gunakan `async` untuk operasi I/O. Return query langsung bila tidak perlu transformasi; gunakan `await` saat hasil perlu dibaca, ditransformasi atau dipakai untuk operasi berikutnya. Ini bukan perbedaan standar.
- Detail tidak ditemukan mengembalikan null; delete mengembalikan keberhasilan; create/update mengembalikan ID. Konflik yang diharapkan memakai error application. Error database tidak dipetakan menjadi konflik tanpa bukti penyebabnya.
- `updatedAt` dan audit ditentukan server. Constraint, presisi, dan migration tetap mengikuti data-model serta bukti DDL, bukan preferensi gaya.

## Service dan dependency

- Repository menyediakan interface bertipe di application. Use case menerima dependency secara eksplisit; use case tunggal boleh berupa fungsi (contoh login), kumpulan use case berupa `create<Feature>Service(repository)`.
- DTO request/response yang dipakai lintas layer bersumber dari `@credit/contracts`. `unknown` dipakai pada batas input yang belum divalidasi, bukan hasil repository publik.
- Composition root `app.ts` membuat dan menghubungkan route fitur. Factory route tidak membuka koneksi database atau mengeksekusi query saat dibuat.
- Import lintas package memakai `@credit/...`; internal server memakai `@server/...`. Type-only dependency memakai `import type`.

## Route dan validasi

```ts
export function createFeatureRoutes(repository: FeatureRepository) {
  const app = new Hono<AuthEnv>();
  const service = createFeatureService(repository);
  const list = app.get("/items", identityContext, async (c) => {
    // Validasi input, panggil service, dan petakan response di sini.
  });
  // Gabungkan schema tipe hasil pendaftaran; jangan hilangkan tipe RPC.
  return app;
}
```

Contoh di atas menunjukkan struktur, bukan implementasi siap salin untuk tipe RPC. Pada implementasi, gunakan `SchemaOf` untuk menggabungkan schema hasil pendaftaran route dan pertahankan semua endpoint dalam tipe yang dikembalikan.

- Daftarkan handler dengan pemanggilan terpisah pada instance app; hindari chaining panjang. Path endpoint ditulis sekali bersama middleware dan handler. Prefix `/api` hanya dipasang di app utama.
- Urutan handler: autentikasi, pemeriksaan izin/lingkup bila diperlukan, validasi request, service, response. Route publik tidak diberi autentikasi hanya untuk menyamakan tampilan kode.
- Query/body/parameter divalidasi Zod dari contracts. JSON malformed menjadi request tidak valid; error internal tidak boleh disamarkan sebagai validasi gagal.
- Gunakan nama `input` untuk body tervalidasi, `query` untuk filter, `result` untuk hasil service. Hindari pembentukan schema baru inline pada route.
- Middleware hanya dibuat ketika dipakai. Authorization client tidak menggantikan pemeriksaan backend. Pemeriksaan tenant, ownership, dan izin per-field mengikuti fitur masing-masing.
- Sukses baca/update/delete menggunakan 200, create 201; input salah 400, autentikasi gagal 401, izin gagal 403, tidak ditemukan 404, konflik yang diketahui 409. Perubahan terhadap kontrak existing wajib dicatat.
- Error berbentuk `{error: string}`. Tangkap error application yang dikenal di presentation, lalu lempar ulang error tak dikenal. Jangan mengirim stack trace atau pesan database ke pengguna.
- Keberadaan `.route` saja tidak menjamin inferensi input RPC. Validator harus mempertahankan tipe request agar gateway tidak memerlukan assertion `as never`.

## Batas penyeragaman saat ini

Perubahan ini menyamakan akses database reference, factory route, tipe hasil repository reference/admin, schema ID, dan helper tipe RPC. Inferensi input RPC existing yang masih memakai assertion tercatat di [logic-holes.md](logic-holes.md); penulisan standar ini tidak berarti masalah tersebut sudah diperbaiki. Validasi response runtime juga belum seragam pada seluruh fitur. Perubahan validator/response berikutnya harus mempertahankan kontrak dan memperbarui test yang relevan.

Verifikasi mengikuti testing.md dan aturan akhir phase pada development-plan.md. Catat hasil nyata dan hapus script test sementara sebelum commit.
