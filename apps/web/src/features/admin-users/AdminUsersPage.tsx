import { Button, Select, TextInput } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { CrudPage } from '@web/components/crud/CrudPage';
import { DeleteAction } from '@web/components/crud/DeleteAction';
import { ListingTable } from '@web/components/crud/ListingTable';
import { useAdminUsers } from '@web/features/admin-users/hooks/useAdminUsers';
import { useSession } from '@web/features/auth/hooks/useSession';
import { crudaAccess } from '@web/utils/cruda';

export function AdminUsersPage() {
  return (
    <CrudPage program="USA" action="read" title="Admin User">
      <Listing />
    </CrudPage>
  );
}
function Listing() {
  const { session } = useSession();
  const access = crudaAccess(session, 'USA');
  const users = useAdminUsers(session?.authToken ?? '');
  return (
    <ListingTable
      rows={users.rows}
      loading={users.loading}
      error={users.error}
      page={users.queries.page}
      total={users.total}
      onPageChange={(page) =>
        users.setQueries((current) => ({ ...current, page }))
      }
      exporting={users.exporting}
      onExport={users.exportRows}
      columns={[
        {
          label: 'Username',
          sortKey: 'username',
          render: (row) => row.username,
        },
        { label: 'Email', sortKey: 'email', render: (row) => row.email },
        {
          label: 'Status',
          sortKey: 'isActive',
          render: (row) => (row.isActive ? 'Aktif' : 'Tidak aktif'),
        },
      ]}
      addAction={
        access.create && (
          <Button component={Link} to="/admin-users/add">
            Tambah administrator
          </Button>
        )
      }
      sortBy={users.queries.sortBy}
      sortDirection={users.queries.sortDirection}
      onSort={(key) =>
        users.setQueries((current) => ({
          ...current,
          sortBy: key,
          sortDirection:
            current.sortBy === key && current.sortDirection === 'asc'
              ? 'desc'
              : 'asc',
          page: 1,
        }))
      }
      filters={
        <>
          <TextInput
            label="Cari"
            description="Cari berdasarkan: Username, email"
            value={users.queries.search ?? ''}
            onChange={(event) => {
              const value = event.currentTarget.value || undefined;
              users.setQueries((current) => ({
                ...current,
                search: value,
                page: 1,
              }));
            }}
          />

          <Select
            label="Status"
            clearable
            value={users.queries.active ?? null}
            onChange={(v) => {
              users.setQueries((current) => ({
                ...current,
                active: v || undefined,
                page: 1,
              }));
            }}
            data={[
              { value: 'true', label: 'Aktif' },
              { value: 'false', label: 'Tidak aktif' },
            ]}
          />
        </>
      }
      actions={(row) => (
        <>
          <Link to="/admin-users/$id" params={{ id: String(row.id) }}>
            Lihat
          </Link>
          {access.update && (
            <Link to="/admin-users/$id/edit" params={{ id: String(row.id) }}>
              Ubah
            </Link>
          )}
          <DeleteAction
            allowed={access.delete}
            pending={users.deleting}
            message="Hapus administrator ini?"
            onDelete={() => users.remove(row.id)}
          />
        </>
      )}
    />
  );
}
