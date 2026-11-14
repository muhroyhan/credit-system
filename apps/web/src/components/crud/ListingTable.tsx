import { ExportTypeEnum } from '@credit/contracts';
import {
  Alert,
  Button,
  Group,
  NumberInput,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from '@mantine/core';
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
  sort,
}: {
  rows: T[];
  columns: Array<{
    label: string;
    render: (row: T) => ReactNode;
    align?: 'right';
  }>;
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
  sort: ReactNode;
}) {
  return (
    <>
      {error && <Alert color="red.8">{error}</Alert>}
      <Group justify="space-between" align="flex-start">
        {addAction}
        <Group gap="xs">
          <Button
            variant="outline"
            color="#005691"
            loading={exporting}
            disabled={loading}
            onClick={() => onExport(ExportTypeEnum.PDF)}
          >
            Export PDF
          </Button>
          <Button
            variant="outline"
            color="#005691"
            loading={exporting}
            disabled={loading}
            onClick={() => onExport(ExportTypeEnum.XLSX)}
          >
            Export XLSX
          </Button>
          <Button
            variant="outline"
            color="#005691"
            loading={exporting}
            disabled={loading}
            onClick={() => onExport(ExportTypeEnum.CSV)}
          >
            Export CSV
          </Button>
          {onExportZip && (
            <Button
              variant="outline"
              color="#005691"
              loading={zipping}
              disabled={loading}
              onClick={onExportZip}
            >
              Export ZIP
            </Button>
          )}
        </Group>
      </Group>
      <Stack component="section" aria-label="Filter dan pengurutan" gap="md">
        <SimpleGrid type="container" cols={{ base: 1, '480px': 2, '760px': 3 }}>
          {filters}
        </SimpleGrid>
        <SimpleGrid
          maw={640}
          w="100%"
          type="container"
          cols={{ base: 1, '480px': 2 }}
        >
          {sort}
        </SimpleGrid>
      </Stack>
      {loading && <Text>Memuat...</Text>}
      <Table.ScrollContainer
        minWidth={700}
        type="native"
        role="region"
        aria-label="Tabel hasil"
        tabIndex={0}
      >
        <Table>
          <Table.Thead>
            <Table.Tr>
              {columns.map((col) => (
                <Table.Th key={col.label} ta={col.align}>
                  {col.label}
                </Table.Th>
              ))}
              <Table.Th>Aksi</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row) => (
              <Table.Tr key={row.id}>
                {columns.map((col) => (
                  <Table.Td
                    key={col.label}
                    ta={col.align}
                    style={
                      col.align
                        ? { fontVariantNumeric: 'tabular-nums' }
                        : undefined
                    }
                  >
                    {col.render(row)}
                  </Table.Td>
                ))}
                <Table.Td>
                  <Group>{actions(row)}</Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      {!loading && !error && !rows.length && (
        <Text c="dimmed">Tidak ada data</Text>
      )}
      <Group justify="space-between" align="end">
        <NumberInput
          w={120}
          label="Halaman"
          min={1}
          max={Math.max(1, Math.ceil(total / 20))}
          value={page}
          onChange={(v) =>
            onPageChange(Math.max(1, Math.floor(Number(v) || 1)))
          }
        />
        <Text>Total: {total}</Text>
      </Group>
    </>
  );
}
