import { Select, TextInput } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { CrudPage } from '@web/components/crud/CrudPage';
import { ListingTable } from '@web/components/crud/ListingTable';
import { useSession } from '@web/features/auth/hooks/useSession';
import { useCredits } from '@web/features/credit/hooks/useCredits';
import { crudaAccess } from '@web/utils/cruda';
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
      error={(rows.list.error ?? rows.exporting.error)?.message}
      page={rows.page}
      total={rows.list.data?.count ?? 0}
      onPageChange={rows.setPage}
      exporting={rows.exporting.isPending}
      onExport={(format) => rows.exporting.mutate(format)}
      columns={[
        { label: 'Nama', render: (r) => r.nama },
        { label: 'Perusahaan', render: (r) => r.companyName },
        { label: 'Nominal', render: (r) => r.credit.jumlahPengajuan },
        { label: 'Tenor', render: (r) => r.credit.jangkaWaktuBulan },
        { label: 'Status', render: (r) => r.credit.status },
      ]}
      addAction={
        (access.create || session?.type === 'debitor') && (
          <Link to="/credits/add">Tambah pengajuan</Link>
        )
      }
      filters={
        <>
          <TextInput
            label="Nama"
            value={rows.name}
            onChange={(e) => {
              rows.setName(e.currentTarget.value);
              rows.setPage(1);
            }}
          />
          <Select
            label="Status"
            data={['pending', 'approved', 'rejected', 'completed']}
            clearable
            value={rows.status || null}
            onChange={(v) => {
              rows.setStatus(v ?? '');
              rows.setPage(1);
            }}
          />
          <Select
            label="Urutkan"
            data={['createdAt', 'id', 'tanggalPengajuan', 'jumlahPengajuan']}
            value={rows.sortBy}
            onChange={(v) => rows.setSortBy(v ?? 'createdAt')}
          />
          <Select
            label="Arah"
            data={['asc', 'desc']}
            value={rows.sortDirection}
            onChange={(v) => rows.setSortDirection(v ?? 'desc')}
          />
        </>
      }
      actions={(row) => (
        <>
          <Link to="/credits/$id" params={{ id: String(row.id) }}>
            Lihat
          </Link>
          {access.update &&
            row.credit.status !== 'approved' &&
            row.credit.status !== 'rejected' && (
              <Link to="/credits/$id/edit" params={{ id: String(row.id) }}>
                Ubah
              </Link>
            )}
        </>
      )}
    />
  );
}
