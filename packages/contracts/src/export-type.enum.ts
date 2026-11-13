/** Shared runtime choices; values are stable API strings. */
export const ExportTypeEnum = {
  PDF: 'pdf',
  XLSX: 'xlsx',
  CSV: 'csv',
} as const;

export type ExportTypeEnum =
  (typeof ExportTypeEnum)[keyof typeof ExportTypeEnum];
