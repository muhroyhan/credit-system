import { Select, TextInput } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { CrudPage } from '@web/components/crud/CrudPage';
import { DeleteAction } from '@web/components/crud/DeleteAction';
import { ListingTable } from '@web/components/crud/ListingTable';
import { useSession } from '@web/features/auth/hooks/useSession';
import { useEmployees } from '@web/features/employees/hooks/useEmployees';
import { crudaAccess } from '@web/utils/cruda';
export function EmployeesPage() {
  return (
    <CrudPage program="CGP" action="read" title="Master Karyawan">
      <Listing />
    </CrudPage>
  );
}
function Listing() {
  const { session } = useSession();
  const access = crudaAccess(session, 'CGP');
  const rows = useEmployees(session?.authToken ?? '');
  return (
    <>
      <Link to="/">Beranda</Link>
      <ListingTable
        rows={rows.list.data?.data ?? []}
        loading={rows.list.isFetching}
        error={
          (rows.list.error ?? rows.remove.error ?? rows.exporting.error)
            ?.message
        }
        page={rows.page}
        total={rows.list.data?.count ?? 0}
        onPageChange={rows.setPage}
        exporting={rows.exporting.isPending}
        onExport={(format) => rows.exporting.mutate(format)}
        columns={[
          { label: 'Nomor induk', render: (r) => r.employeeId },
          { label: 'Nama', render: (r) => r.namaLengkap },
          { label: 'Alias', render: (r) => r.namaAlias },
          { label: 'NIK', render: (r) => r.noKtp },
          { label: 'Perusahaan', render: (r) => r.companyName },
        ]}
        addAction={
          access.create && <Link to="/employees/add">Tambah karyawan</Link>
        }
        filters={
          <>
            <TextInput
              label="Cari nama"
              value={rows.filters.namaLengkap}
              onChange={(e) =>
                rows.filter('namaLengkap', e.currentTarget.value)
              }
            />
            <TextInput
              label="Cari alias"
              value={rows.filters.namaAlias}
              onChange={(e) => rows.filter('namaAlias', e.currentTarget.value)}
            />
            <Select
              label="Urutkan"
              data={['createdAt', 'id', 'employeeId', 'namaLengkap']}
              value={rows.filters.sortBy}
              onChange={(v) => {
                if (v) {
                  rows.filter('sortBy', v);
                }
              }}
            />
            <Select
              label="Arah"
              data={['asc', 'desc']}
              value={rows.filters.sortDirection}
              onChange={(v) => {
                if (v) {
                  rows.filter('sortDirection', v);
                }
              }}
            />
          </>
        }
        actions={(row) => (
          <>
            <Link to="/employees/$id" params={{ id: String(row.id) }}>
              Lihat
            </Link>
            {access.update && (
              <Link to="/employees/$id/edit" params={{ id: String(row.id) }}>
                Ubah
              </Link>
            )}
            <DeleteAction
              allowed={access.delete}
              pending={rows.remove.isPending}
              message="Hapus karyawan ini?"
              onDelete={() => rows.remove.mutate(row.id)}
            />
          </>
        )}
      />
    </>
  );
}
