export async function exportFile({
  title,
  columns,
  values,
  format,
}: {
  title: string;
  columns: string[];
  values: string[][];
  format: "pdf" | "xlsx";
}) {
  if (format === "xlsx") {
    const ExcelJS = (await import("exceljs")).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(title);
    sheet.addRow(columns);
    sheet.addRows(values);
    sheet.getRow(1).font = { bold: true };
    sheet.columns.forEach((column) => {
      column.width = 32;
    });
    return new Uint8Array(await workbook.xlsx.writeBuffer());
  }
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "landscape" });
  const width = 270 / columns.length;
  let y = 28;
  const header = () => {
    doc.setFontSize(16);
    doc.text(title, 10, 12);
    doc.setFontSize(10);
    columns.forEach((col, i) => {
      doc.text(col, 10 + i * width, 20);
    });
    y = 28;
  };
  header();
  for (const row of values) {
    const cells = row.map(
      (cell) => doc.splitTextToSize(cell, width - 5) as string[],
    );
    for (
      let line = 0;
      line < Math.max(1, ...cells.map((cell) => cell.length));
      line++
    ) {
      if (y > 195) {
        doc.addPage();
        header();
      }
      cells.forEach((cell, i) => {
        doc.text(cell[line] ?? "", 10 + i * width, y);
      });
      y += 5;
    }
    y += 3;
  }
  return new Uint8Array(doc.output("arraybuffer"));
}
