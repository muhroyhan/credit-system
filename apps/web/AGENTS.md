# Frontend

Komponen memakai hook/use case; RPC dan mapping DTO berada di feature.api.ts. Hook dalam feature/hooks. Dashboard terpisah dari auth.

Root router.tsx mendefinisikan /, /login dan prefix fitur. Child route di feature.routes.ts melalui createCrudRoutes. Empat halaman standar:

| Page | Tugas |
| --- | --- |
| FeaturePage | Listing dengan filter/sort/pagination, aksi baris, tambah dan ekspor |
| FeatureAddPage | Form tambah |
| FeatureEditPage | Form edit, boleh berbagi komponen form dengan tambah |
| FeatureViewPage | Detail berupa teks; bukan input disabled |

Pakai komponen bersama src/components/crud: CrudPage (layout/ACL), ListingTable (tabel/pagination/export), RecordState (ID/loading/error), DetailFields, DeleteAction dan FormActions. Fitur menyediakan kolom, filter, mapping, field dan hook; jangan menyalin layout/kontrol yang sama.

TanStack Router mengelola routing; TanStack Query mengelola data API. Query key mencakup sesi/parameter, mutation menginvalidasi query terkait, cache dibersihkan saat logout. React Hook Form memakai Zod resolver, menampilkan error per field, dan tidak meneruskan data invalid ke mutation. UI menampilkan loading/kosong/sukses/gagal sesuai hasil operasi.

Gate CRUDA melindungi halaman dan aksi sebelum konten/query dimount, termasuk akses URL langsung. Hak UI memakai snapshot login; otorisasi API tetap wajib. Kontrak sesi/izin hanya di api-contract.md.

Rujuk [kontrak API](../../docs/credit-system/api-contract.md) dan aturan bisnis pada dokumen proyek.
