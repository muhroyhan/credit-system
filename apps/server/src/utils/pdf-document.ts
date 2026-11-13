/** Renders supplied document text to an A4 PDF without loading remote URLs. */
export async function renderTextPdf(
  title: string,
  sections: Array<{ heading: string; paragraphs: string[] }>,
): Promise<Uint8Array> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const bottom = 280;
  let y = 20;
  function write(value: string, bold: boolean) {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    const lines: string[] = doc.splitTextToSize(value, 174);
    for (const line of lines) {
      if (y > bottom) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 18, y);
      y += 6;
    }
    y += 3;
  }
  doc.setFontSize(11);
  write(title, true);
  for (const section of sections) {
    write(section.heading, true);
    for (const paragraph of section.paragraphs) {
      write(paragraph, false);
    }
  }
  return new Uint8Array(doc.output('arraybuffer'));
}
