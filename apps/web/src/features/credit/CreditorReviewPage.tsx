import { Select, TextInput } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { CrudPage } from '@web/components/crud/CrudPage';
import { ListingTable } from '@web/components/crud/ListingTable';
import { useSession } from '@web/features/auth/hooks/useSession';
import { exportReviews } from '@web/features/credit/credit.api';
import { useCreditReviews } from '@web/features/credit/hooks/useCreditReviews';
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
  const [page, setPage] = useState(1);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('approved');
  const [companyId, setCompanyId] = useState('');
  const [debitorId, setDebitorId] = useState('');
  const [bprStatus, setBprStatus] = useState('');
  const query = new URLSearchParams({
    page: String(page),
    limit: '20',
    status,
    nama: name,
  });
  if (companyId) {
    query.set('userId', companyId);
  }
  if (debitorId) {
    query.set('debitorId', debitorId);
  }
  if (bprStatus) {
    query.set('statusAdminApproval', bprStatus);
  }
  const list = useCreditReviews(token, query);
  const exporting = useMutation({
    mutationFn: (format: 'pdf' | 'xlsx') => exportReviews(token, query, format),
  });
  return (
    <ListingTable
      rows={(list.data?.data ?? []).map((row) => ({
        ...row,
        id: row.credit.id,
      }))}
      loading={list.isFetching}
      error={(list.error ?? exporting.error)?.message}
      page={page}
      total={list.data?.count ?? 0}
      onPageChange={setPage}
      exporting={exporting.isPending}
      onExport={(format) => exporting.mutate(format)}
      filters={
        <>
          <TextInput
            label="ID perusahaan"
            type="number"
            min={1}
            value={companyId}
            onChange={(event) => {
              setCompanyId(event.currentTarget.value);
              setPage(1);
            }}
          />
          <TextInput
            label="ID debitor"
            type="number"
            min={1}
            value={debitorId}
            onChange={(event) => {
              setDebitorId(event.currentTarget.value);
              setPage(1);
            }}
          />
          <Select
            label="Status BPR"
            data={['pending', 'approved', 'rejected', 'completed']}
            clearable
            value={bprStatus || null}
            onChange={(value) => {
              setBprStatus(value ?? '');
              setPage(1);
            }}
          />
          <TextInput
            label="Nama"
            value={name}
            onChange={(event) => {
              setName(event.currentTarget.value);
              setPage(1);
            }}
          />
          <Select
            label="Status HRD"
            data={['pending', 'approved', 'rejected', 'completed']}
            value={status}
            onChange={(value) => {
              setStatus(value ?? 'approved');
              setPage(1);
            }}
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
