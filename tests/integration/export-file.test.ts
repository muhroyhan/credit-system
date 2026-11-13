import { exportFile } from '@server/utils/export-file';
import ExcelJS from 'exceljs';
import { describe, expect, it } from 'vitest';

describe('EXPORT-I real file encoders', () => {
  it('round-trips XLSX cells, Unicode and leading zeroes', async () => {
    const bytes = await exportFile({
      title: 'QA',
      columns: ['Nama', 'Rekening'],
      values: [
        ['Nasabah é', '001234'],
        ['=formula', '0'],
      ],
      format: 'xlsx',
    });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(bytes.buffer);
    const sheet = workbook.getWorksheet('QA');
    expect(sheet?.rowCount).toBe(3);
    expect(sheet?.getRow(1).values).toEqual([undefined, 'Nama', 'Rekening']);
    expect(sheet?.getCell('A2').value).toBe('Nasabah é');
    expect(sheet?.getCell('B2').value).toBe('001234');
    expect(sheet?.getCell('A3').type).toBe(ExcelJS.ValueType.String);
  });
  it('renders every row across PDF pages with repeated headers', async () => {
    const bytes = await exportFile({
      title: 'QA document',
      columns: ['Nama'],
      values: Array.from({ length: 100 }, (_, i) => [`QA-row-${i}`]),
      format: 'pdf',
    });
    const content = new TextDecoder('latin1').decode(bytes);
    expect(content.startsWith('%PDF-')).toBe(true);
    expect(content).toContain('QA-row-0');
    expect(content).toContain('QA-row-99');
    expect(content.match(/QA document/g)?.length).toBeGreaterThan(1);
  });
});
