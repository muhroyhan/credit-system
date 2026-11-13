import { Select, TextInput } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { CrudPage } from '@web/components/crud/CrudPage';
import { ListingSort } from '@web/components/crud/ListingSort';
import { ListingTable } from '@web/components/crud/ListingTable';
import { useSession } from '@web/features/auth/hooks/useSession';
import { exportReviews } from '@web/features/credit-review/credit-review.api';
import { useCreditReviews } from '@web/features/credit-review/hooks/useCreditReviews';
import { toSearchParams } from '@web/utils/search-params';
import { useState } from 'react';
export function CreditorReviewPage() {
  return (
    <CrudPage program="DKN" action="read" title="Daftar Kredit Karyawan">
      <Content />
    </CrudPage>
  );
}
function Content() {
  const { session } = useSession();
  const token = session?.authToken ?? '';
  const [queries, setQueries] = useState({
    page: 1,
    limit: 20,
    nama: undefined as string | undefined,
    status: 'approved',
    sortBy: 'createdAt',
    sortDirection: 'desc',
    userId: undefined as string | undefined,
    debitorId: undefined as string | undefined,
    statusAdminApproval: undefined as string | undefined,
  });
  const list = useCreditReviews(token, queries);
  const exporting = useMutation({
    mutationFn: (format: 'pdf' | 'xlsx') =>
      exportReviews(token, toSearchParams(queries), format),
  });
  return (
    <ListingTable
      rows={(list.data?.data ?? []).map((row) => ({
        ...row,
        id: row.credit.id,
      }))}
      loading={list.isFetching}
      error={(list.error ?? exporting.error)?.message}
      page={queries.page}
      total={list.data?.count ?? 0}
      onPageChange={(page) => setQueries((current) => ({ ...current, page }))}
      exporting={exporting.isPending}
      onExport={(format) => exporting.mutate(format)}
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
            data={['pending', 'approved', 'rejected', 'completed']}
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
            data={['pending', 'approved', 'rejected', 'completed']}
            value={queries.status ?? ''}
            onChange={(value) => {
              setQueries((current) => ({
                ...current,
                status: value ?? 'approved',
                page: 1,
              }));
            }}
          />
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
        </>
      }
      columns={[
        { label: 'Nama', render: (row) => row.nama },
        { label: 'Perusahaan', render: (row) => row.companyName },
        { label: 'Nominal', render: (row) => row.credit.jumlahPengajuan },
        { label: 'Status HRD', render: (row) => row.credit.status },
        {
          label: 'Status BPR',
          render: (row) => row.credit.statusAdminApproval,
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
