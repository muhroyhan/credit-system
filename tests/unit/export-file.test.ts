import { exportFile, exportHeaders } from '@server/utils/export-file';
import { describe, expect, it } from 'vitest';

describe('export response headers', () => {
  it.each([
    ['pdf', 'application/pdf'],
    ['csv', 'text/csv; charset=utf-8'],
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

it.each([
  '=SUM(A1)',
  '+command',
  '-formula',
  '@formula',
  '  =formula',
  '\t+formula',
])('neutralizes spreadsheet formula %s', async (value) => {
  const bytes = await exportFile({
    title: 'QA',
    columns: ['Name'],
    values: [[value]],
    format: 'csv',
  });
  expect(new TextDecoder().decode(bytes)).toContain(`"'${value}"`);
});

it('writes a BOM, CRLF records and headers for an empty CSV', async () => {
  const bytes = await exportFile({
    title: 'QA',
    columns: ['Nama'],
    values: [],
    format: 'csv',
  });
  expect(Array.from(bytes.slice(0, 3))).toEqual([239, 187, 191]);
  expect(new TextDecoder().decode(bytes)).toBe('"Nama"\r\n');
});

it('escapes CSV fields and spreadsheet formulas without truncation', async () => {
  const bytes = await exportFile({
    title: 'CSV',
    columns: ['Nama', 'Catatan'],
    values: [
      ['A, B', 'quoted "line"'],
      ['=formula', 'baris\nbaru'],
    ],
    format: 'csv',
  });
  const text = new TextDecoder().decode(bytes);
  expect(text).toContain('"A, B","quoted ""line"""');
  expect(text).toContain('"\'=formula","baris\nbaru"');
});
