# Database

Sebelum mengubah schema atau constraint, verifikasi DDL dan periksa [model data](../../docs/credit-system/data-model.md). Gunakan Drizzle untuk migration dan seed melalui runner pada [pengembangan lokal](../../docs/credit-system/local-development.md); migration tidak otomatis saat build. Pool dan transaksi mengikuti [instruksi backend](../../apps/server/AGENTS.md).

Selama proyek belum production, pertahankan satu baseline SQL `drizzle/0000_baseline.sql`. Setiap perubahan schema harus memperbarui baseline dan snapshot yang sama dengan `pnpm db:generate`, bukan menambah file migration. Jangan menulis ulang histori database yang sudah berisi data; gunakan database lokal disposable baru bila baseline berubah.
