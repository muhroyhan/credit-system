# credit-system — instruksi agent

## Cara bekerja

- Jangan mengubah aturan bisnis tanpa instruksi pengguna. Catat keputusan/risiko pada sumbernya; bedakan kebutuhan, implementasi dan hasil verifikasi. Jangan mengklaim fitur atau test sudah tersedia tanpa bukti.
- Gunakan peta sumber di bawah. Tiap konteks memiliki satu dokumen pemilik; dokumen lain cukup menautkannya. Instruksi khusus direktori berlaku bersama instruksi ini.
- Jadwal task/commit/test mengikuti development-plan.md. Rahasia dan data produksi tidak digunakan untuk pengembangan/test.

## Peta sumber

| Konteks | Sumber tunggal |
| --- | --- |
| Alur, rumus, status, kebutuhan fitur | [business-flow.md](docs/credit-system/business-flow.md) |
| Stack, struktur, layer, penamaan dan gaya kode | [architecture.md](docs/credit-system/architecture.md) |
| Endpoint, payload, DTO dan otorisasi | [api-contract.md](docs/credit-system/api-contract.md) |
| Kamus data dan batas skema fisik | [data-model.md](docs/credit-system/data-model.md) |
| Phase, task, dependensi, aturan commit | [development-plan.md](docs/credit-system/development-plan.md) |
| Risiko terbuka dan keputusan kompatibilitas | [logic-holes.md](docs/credit-system/logic-holes.md) |
| Acceptance dan bukti test | [testing.md](docs/credit-system/testing.md) |
| Setup, perintah dan lifecycle lokal | [local-development.md](docs/credit-system/local-development.md) |

## Instruksi direktori

[Server](apps/server/AGENTS.md) · [Web](apps/web/AGENTS.md) · [Database](packages/database/AGENTS.md) · [E2E](tests/e2e/AGENTS.md)
