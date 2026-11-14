import { CreditStatusEnum } from '@credit/contracts';
import { Select, TextInput } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { CrudPage } from '@web/components/crud/CrudPage';
import { ListingSort } from '@web/components/crud/ListingSort';
import { ListingTable } from '@web/components/crud/ListingTable';
import { StatusBadge } from '@web/components/StatusBadge';
import { statusPresentation } from '@web/constant/constant';
import { useSession } from '@web/features/auth/hooks/useSession';
import { useCreditReviews } from '@web/features/credit-review/hooks/useCreditReviews';
import { formatMoney } from '@web/utils/format-money';
export function CreditorReviewPage() {
  return (
    <CrudPage program="DKN" action="read" title="Daftar Kredit Karyawan">
      <Content />
    </CrudPage>
  );
}
function Content() {
  const { session } = useSession();
  const { queries, setQueries, list, exporting, zip } = useCreditReviews(
    session?.authToken ?? '',
  );
  return (
    <ListingTable
      rows={(list.data?.data ?? []).map((row) => ({
        ...row,
        id: row.credit.id,
      }))}
      loading={list.isFetching}
      error={(list.error ?? exporting.error ?? zip.error)?.message}
      page={queries.page}
      total={list.data?.count ?? 0}
      onPageChange={(page) => setQueries((current) => ({ ...current, page }))}
      exporting={exporting.isPending}
      onExport={(format) => exporting.mutate(format)}
      onExportZip={() => zip.mutate()}
      zipping={zip.isPending}
      sort={
        <ListingSort
          value={queries.sortBy}
          direction={queries.sortDirection}
          options={['createdAt', 'id', 'tanggalPengajuan', 'jumlahPengajuan']}
          onSort={(value) =>
            setQueries((current) => ({ ...current, sortBy: value, page: 1 }))
          }
          onDirection={(value) =>
            setQueries((current) => ({
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
            label="ID perusahaan"
            type="number"
            min={1}
            value={queries.userId ?? ''}
            onChange={(event) => {
              const value = event.currentTarget.value || undefined;
              setQueries((current) => ({
                ...current,
                userId: value,
                page: 1,
              }));
            }}
          />
          <TextInput
            label="ID debitor"
            type="number"
            min={1}
            value={queries.debitorId ?? ''}
            onChange={(event) => {
              const value = event.currentTarget.value || undefined;
              setQueries((current) => ({
                ...current,
                debitorId: value,
                page: 1,
              }));
            }}
          />
          <Select
            label="Status BPR"
            data={Object.values(CreditStatusEnum).map((value) => ({
              value,
              label: statusPresentation[value]?.label ?? value,
            }))}
            clearable
            value={queries.statusAdminApproval ?? null}
            onChange={(value) => {
              setQueries((current) => ({
                ...current,
                statusAdminApproval: value ?? undefined,
                page: 1,
              }));
            }}
          />
          <TextInput
            label="Nama"
            value={queries.nama ?? ''}
            onChange={(event) => {
              const value = event.currentTarget.value || undefined;
              setQueries((current) => ({
                ...current,
                nama: value,
                page: 1,
              }));
            }}
          />
          <Select
            label="Status HRD"
            data={Object.values(CreditStatusEnum).map((value) => ({
              value,
              label: statusPresentation[value]?.label ?? value,
            }))}
            value={queries.status ?? ''}
            onChange={(value) => {
              setQueries((current) => ({
                ...current,
                status: value ?? 'approved',
                page: 1,
              }));
            }}
          />
        </>
      }
      columns={[
        { label: 'Nama', render: (row) => row.nama },
        { label: 'Perusahaan', render: (row) => row.companyName },
        {
          label: 'Nominal',
          align: 'right',
          render: (row) => formatMoney(row.credit.jumlahPengajuan),
        },
        {
          label: 'Status HRD',
          render: (row) => <StatusBadge value={row.credit.status} />,
        },
        {
          label: 'Status BPR',
          render: (row) => (
            <StatusBadge value={row.credit.statusAdminApproval} />
          ),
        },
      ]}
      actions={(row) => (
        <Link to="/credit-reviews/$id" params={{ id: String(row.id) }}>
          Lihat
        </Link>
      )}
    />
  );
}
