# E2E

Playwright memakai aplikasi, database dan API nyata; jangan mock API aplikasi pada skenario fullstack. Clock/timezone dan fixture dibuat deterministik; cleanup data/resource agar dapat diulang, simpan trace kegagalan. Runner native dan isolasi DB mengikuti runbook lokal. Ikuti [cakupan acceptance](../../docs/credit-system/testing.md#cakupan-acceptance) dan jadwal phase di AGENTS.md root. Baca instruksi server/web/database jika fixture mengubah area tersebut.

Setup login fitur memakai fixtures/login.ts; skenario acceptance login tetap menguji kontrol/request langsung. Test yang mengakses SQL memakai fixtures/test.ts agar pool ditutup sekali pada akhir worker. Guard database integrasi memakai @credit/test-utils/database sebelum koneksi dibuat.
