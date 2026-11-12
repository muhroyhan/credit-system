import { adminUsersRepository } from "@server/features/admin-users/admin-users.repository";

import type {
  AdminInput,
  AdminQuery,
} from "@server/features/admin-users/admin-users.type";
export const adminUsersService = {
  async exportFile(query: AdminQuery, format: "pdf" | "xlsx") {
    const rows = await adminUsersRepository.exportRows(query);
    const values = rows.map((row) => [
      row.username ?? "",
      row.email ?? "",
      row.isActive ? "Aktif" : "Tidak aktif",
    ]);
    if (format === "xlsx") {
      const ExcelJS = (await import("exceljs")).default;
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Admin User");
      sheet.addRow(["Username", "Email", "Status"]);
      sheet.addRows(values);
      sheet.getRow(1).font = { bold: true };
      sheet.columns.forEach((column) => {
        column.width = 32;
      });
      return new Uint8Array(await workbook.xlsx.writeBuffer());
    }
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "landscape" });
    let y = 28;
    const header = () => {
      doc.setFontSize(16);
      doc.text("Admin User", 10, 12);
      doc.setFontSize(10);
      ["Username", "Email", "Status"].forEach((col, i) => {
        doc.text(col, 10 + i * 90, 20);
      });
      y = 28;
    };
    header();
    for (const row of values) {
      const cells = row.map(
        (cell) => doc.splitTextToSize(cell, 85) as string[],
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
          doc.text(cell[line] ?? "", 10 + i * 90, y);
        });
        y += 5;
      }
      y += 3;
    }
    return new Uint8Array(doc.output("arraybuffer"));
  },
  list: (query: AdminQuery) => adminUsersRepository.list(query),
  detail: (id: number) => adminUsersRepository.detail(id),
  async save(input: AdminInput, actor: string, id?: number) {
    const password = input.password
      ? await Bun.password.hash(input.password, {
          algorithm: "bcrypt",
          cost: 10,
        })
      : undefined;
    return adminUsersRepository.save({ ...input, password }, actor, id);
  },
  remove: (id: number) => adminUsersRepository.remove(id),
};
