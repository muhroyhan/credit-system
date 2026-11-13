import { renderTextPdf } from '@server/utils/pdf-document';
import { expect, it } from 'vitest';

it('renders supplied document sections as an A4 PDF', async () => {
  const bytes = await renderTextPdf('Dokumen sintetis', [
    { heading: 'Bagian satu', paragraphs: ['Isi sintetis untuk pengujian'] },
  ]);
  const content = new TextDecoder('latin1').decode(bytes);
  expect(content.startsWith('%PDF-')).toBe(true);
  expect(content).toContain('Dokumen sintetis');
  expect(content).toContain('Isi sintetis untuk pengujian');
  const box = content.match(/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/);
  expect(Number(box?.[1])).toBeCloseTo(595.28, 2);
  expect(Number(box?.[2])).toBeCloseTo(841.89, 2);
});
