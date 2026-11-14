import { AccountTypeEnum, CreditStatusEnum } from '@credit/contracts';
import { Button, Select, TextInput } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { CrudPage } from '@web/components/crud/CrudPage';
import { ListingSort } from '@web/components/crud/ListingSort';
import { ListingTable } from '@web/components/crud/ListingTable';
import { StatusBadge } from '@web/components/StatusBadge';
import { statusPresentation } from '@web/constant/constant';
import { useSession } from '@web/features/auth/hooks/useSession';
import { useCredits } from '@web/features/credit/hooks/useCredits';
import { crudaAccess } from '@web/utils/cruda';
import { formatMoney } from '@web/utils/format-money';
export function CreditPage() {
  return (
    <CrudPage program="CGP" action="read" title="Pengajuan Kredit">
      <Content />
    </CrudPage>
  );
}
function Content() {
  const { session } = useSession();
  const access = crudaAccess(session, 'CGP');
  const rows = useCredits(session?.authToken ?? '');
  return (
    <ListingTable
      rows={(rows.list.data?.data ?? []).map((row) => ({
        ...row,
        id: row.credit.id,
      }))}
      loading={rows.list.isFetching}
      error={
        (rows.list.error ?? rows.exporting.error ?? rows.zip.error)?.message
      }
      page={rows.queries.page}
      total={rows.list.data?.count ?? 0}
      onPageChange={(page) =>
        rows.setQueries((current) => ({ ...current, page }))
      }
      exporting={rows.exporting.isPending}
      onExport={(format) => rows.exporting.mutate(format)}
      onExportZip={() => rows.zip.mutate()}
      zipping={rows.zip.isPending}
      columns={[
        { label: 'Nama', render: (r) => r.nama },
        { label: 'Perusahaan', render: (r) => r.companyName },
        {
          label: 'Nominal',
          align: 'right',
          render: (r) => formatMoney(r.credit.jumlahPengajuan),
        },
        { label: 'Tenor', render: (r) => r.credit.jangkaWaktuBulan },
        {
          label: 'Status',
          render: (r) => <StatusBadge value={r.credit.status} />,
        },
      ]}
      addAction={
        (access.create || session?.type === AccountTypeEnum.Debitor) && (
          <Button component={Link} to="/credits/add">
            Tambah pengajuan
          </Button>
        )
      }
      sort={
        <ListingSort
          value={rows.queries.sortBy}
          direction={rows.queries.sortDirection}
          options={['createdAt', 'id', 'tanggalPengajuan', 'jumlahPengajuan']}
          onSort={(value) =>
            rows.setQueries((current) => ({
              ...current,
              sortBy: value,
              page: 1,
            }))
          }
          onDirection={(value) =>
            rows.setQueries((current) => ({
              ...current,
              sortDirection: value,
              page: 1,
            }))
          }
        />
      }
      filters={
        <>
          <TextInput
            label="Nama"
            value={rows.queries.nama ?? ''}
            onChange={(e) => {
              const value = e.currentTarget.value || undefined;
              rows.setQueries((current) => ({
                ...current,
                nama: value,
                page: 1,
              }));
            }}
          />
          <Select
            label="Status"
            data={Object.values(CreditStatusEnum).map((value) => ({
              value,
              label: statusPresentation[value]?.label ?? value,
            }))}
            clearable
            value={rows.queries.status || null}
            onChange={(v) => {
              rows.setQueries((current) => ({
                ...current,
                status: v ?? undefined,
                page: 1,
              }));
            }}
          />
        </>
      }
      actions={(row) => (
        <>
          <Link to="/credits/$id" params={{ id: String(row.id) }}>
            Lihat
          </Link>
          {access.update &&
            row.credit.status !== CreditStatusEnum.Approved &&
            row.credit.status !== CreditStatusEnum.Rejected && (
              <Link to="/credits/$id/edit" params={{ id: String(row.id) }}>
                Ubah
              </Link>
            )}
        </>
      )}
    />
  );
}
