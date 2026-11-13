# E2E

Playwright full-stack scenarios use the real application, API and database; do
not mock the application API. Use deterministic clock/timezone and fixtures,
clean up data and resources for repeatability, and retain failure traces. Follow
the isolated native test setup in the [README](../../README.md). Read server,
web and database instructions when fixtures affect those areas.

Feature login setup uses `fixtures/login.ts`; login acceptance scenarios still
exercise the actual controls and requests. Tests accessing SQL use
`fixtures/test.ts` so the pool closes once per worker. Use the
`@credit/test-utils/database` integration database guard before connecting.
