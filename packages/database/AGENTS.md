# Database credit-system

- Gunakan Drizzle ORM dan MySQL; rujuk kamus 24 entitas serta relasi pada `docs/credit-system/data-model.md`.
- Bedakan relasi konseptual dan FK fisik. Verifikasi tipe, ukuran, nullable, default, index, constraint dan data sebelum menyusun migration.
- Pertahankan penamaan dan semantik bisnis; perubahan presisi nominal, rounding, tipe, constraint atau seed perlu keputusan dan test yang relevan.
- Jalankan migration dan integration test hanya pada database yang sesuai konteks tugas; gunakan database disposable untuk test.
- Gunakan satu connection pool bersama selama proses aplikasi berjalan; repository tidak menutup pool. Tutup pool saat proses aplikasi atau runner mandiri berakhir.
