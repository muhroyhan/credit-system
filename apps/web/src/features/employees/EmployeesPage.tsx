import { Button, TextInput } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { CrudPage } from '@web/components/crud/CrudPage';
import { DeleteAction } from '@web/components/crud/DeleteAction';
import { ListingSort } from '@web/components/crud/ListingSort';
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
    <ListingTable
      rows={rows.list.data?.data ?? []}
      loading={rows.list.isFetching}
      error={
        (rows.list.error ?? rows.remove.error ?? rows.exporting.error)?.message
      }
      page={rows.queries.page}
      total={rows.list.data?.count ?? 0}
      onPageChange={(page) =>
        rows.setQueries((current) => ({ ...current, page }))
      }
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
        access.create && (
          <Button component={Link} to="/employees/add">
            Tambah karyawan
          </Button>
        )
      }
      sort={
        <ListingSort
          value={rows.queries.sortBy}
          direction={rows.queries.sortDirection}
          options={['createdAt', 'id', 'employeeId', 'namaLengkap']}
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
            label="Cari nama"
            value={rows.queries.namaLengkap ?? ''}
            onChange={(e) => {
              const value = e.currentTarget.value || undefined;
              rows.setQueries((current) => ({
                ...current,
                namaLengkap: value,
                page: 1,
              }));
            }}
          />
          <TextInput
            label="Cari alias"
            value={rows.queries.namaAlias ?? ''}
            onChange={(e) => {
              const value = e.currentTarget.value || undefined;
              rows.setQueries((current) => ({
                ...current,
                namaAlias: value,
                page: 1,
              }));
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
  );
}
