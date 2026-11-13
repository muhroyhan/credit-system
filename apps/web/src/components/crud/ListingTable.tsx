import { ExportTypeEnum } from '@credit/contracts';
import { Alert, Button, Group, NumberInput, Table, Text } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

export function ListingTable<T extends { id: number }>({
  rows,
  columns,
  actions,
  loading,
  error,
  page,
  total,
  onPageChange,
  exporting,
  onExport,
  onExportZip,
  zipping,
  addAction,
  filters,
}: {
  rows: T[];
  columns: Array<{ label: string; render: (row: T) => ReactNode }>;
  actions: (row: T) => ReactNode;
  loading: boolean;
  error?: string;
  page: number;
  total: number;
  onPageChange: (page: number) => void;
  exporting: boolean;
  onExportZip?: () => void;
  zipping?: boolean;
  onExport: (format: ExportTypeEnum) => void;
  addAction?: ReactNode;
  filters: ReactNode;
}) {
  return (
    <>
      {error && <Alert color="red">{error}</Alert>}
      <Link to="/">Beranda</Link>
      <Group>{filters}</Group>
      <Group>
        {addAction}
        <Button
          loading={exporting}
          disabled={loading}
          onClick={() => onExport(ExportTypeEnum.PDF)}
        >
          Export PDF
        </Button>
        <Button
          loading={exporting}
          disabled={loading}
          onClick={() => onExport(ExportTypeEnum.XLSX)}
        >
          Export XLSX
        </Button>
        <Button
          loading={exporting}
          disabled={loading}
          onClick={() => onExport(ExportTypeEnum.CSV)}
        >
          Export CSV
        </Button>
        {onExportZip && (
          <Button loading={zipping} disabled={loading} onClick={onExportZip}>
            Export ZIP
          </Button>
        )}
      </Group>
      {loading && <Text>Memuat...</Text>}
      <Table>
        <Table.Thead>
          <Table.Tr>
            {columns.map((col) => (
              <Table.Th key={col.label}>{col.label}</Table.Th>
            ))}
            <Table.Th>Aksi</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row) => (
            <Table.Tr key={row.id}>
              {columns.map((col) => (
                <Table.Td key={col.label}>{col.render(row)}</Table.Td>
              ))}
              <Table.Td>
                <Group>{actions(row)}</Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      {!loading && !rows.length && <Text>Tidak ada data</Text>}
      <NumberInput
        label="Halaman"
        min={1}
        max={Math.max(1, Math.ceil(total / 20))}
        value={page}
        onChange={(v) => onPageChange(Math.max(1, Math.floor(Number(v) || 1)))}
      />
      <Text>Total: {total}</Text>
    </>
  );
}
