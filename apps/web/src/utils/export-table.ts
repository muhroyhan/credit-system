type TableExport = {
  title: string;
  filename: string;
  columns: string[];
  rows: string[][];
};
export async function exportTable(table: TableExport, format: "pdf" | "xlsx") {
  if (format === "xlsx") {
    const { default: ExcelJS } = await import("exceljs");
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(table.title);
    sheet.addRow(table.columns);
    sheet.addRows(table.rows);
    sheet.getRow(1).font = { bold: true };
    sheet.columns.forEach((column) => {
      column.width = 32;
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const url = URL.createObjectURL(
      new Blob([new Uint8Array(buffer)], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${table.filename}.xlsx`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "landscape" });
  const width = 270 / table.columns.length;
  let y = 25;
  const header = () => {
    doc.setFontSize(16);
    doc.text(table.title, 10, 12);
    doc.setFontSize(10);
    table.columns.forEach((column, i) => {
      doc.text(column, 10 + i * width, 20);
    });
    y = 28;
  };
  header();
  for (const row of table.rows) {
    const cells = row.map(
      (cell) => doc.splitTextToSize(cell, width - 5) as string[],
    );
    const lines = Math.max(1, ...cells.map((cell) => cell.length));
    for (let line = 0; line < lines; line++) {
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
  doc.save(`${table.filename}.pdf`);
}
