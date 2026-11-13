import { exportHeaders } from '@server/utils/export-file';
import { describe, expect, it } from 'vitest';

describe('export response headers', () => {
  it.each([
    ['pdf', 'application/pdf'],
    [
      'xlsx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  ] as const)(
    'preserves the %s binary response and attachment name',
    async (format, mime) => {
      const bytes = new Uint8Array([0, 128, 255]);
      const response = new Response(bytes, {
        headers: exportHeaders('credits', format),
      });
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe(mime);
      expect(response.headers.get('Content-Disposition')).toBe(
        `attachment; filename="credits.${format}"`,
      );
      expect(new Uint8Array(await response.arrayBuffer())).toEqual(bytes);
    },
  );
});
