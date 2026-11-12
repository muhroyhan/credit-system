import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
export default defineConfig({
  resolve: {
    alias: {
      '@server': fileURLToPath(new URL('./apps/server/src', import.meta.url)),
      '@web': fileURLToPath(new URL('./apps/web/src', import.meta.url)),
    },
  },
  test: {
    projects: [
      { test: { name: 'unit', include: ['tests/unit/**/*.test.ts'] } },
      {
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts'],
        },
      },
    ],
  },
});
