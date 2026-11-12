# Pengembangan lokal

Salin `.env.example` ke `.env`, ganti password lokal, lalu jalankan `docker compose up -d`. Server, Vite, migration dan seed berjalan native. Jalankan `pnpm db:migrate` dan `pnpm db:seed` secara eksplisit. Gunakan database disposable terpisah untuk test. Jangan gunakan kredensial atau database produksi.

Seed sintetis menggunakan ID 900001 ke atas pada database lokal khusus yang namanya berakhir `_development` atau `_test`. Set `DATABASE_URL`, `SEED_SYNTHETIC=true`, dan `SEED_PASSWORD` (minimal 8 karakter) di environment sebelum menjalankan `pnpm db:seed`; gunakan password lokal yang tidak dipakai di produksi. Jalankan pada database terpisah yang disiapkan khusus untuk seed ini. Eksekusi ulang mempertahankan baris berdasarkan ID dan tidak memperbarui password atau data yang sudah ada. Semua akun dan alamat pada seed bersifat sintetis.
