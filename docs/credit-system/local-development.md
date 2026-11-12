# Pengembangan lokal

Salin `.env.example` ke `.env`, ganti password lokal, lalu jalankan `docker compose up -d`. Server, Vite, migration dan seed berjalan native. Jalankan `pnpm db:migrate` dan `pnpm db:seed` secara eksplisit. Gunakan database disposable terpisah untuk test. Jangan gunakan kredensial atau database produksi.
