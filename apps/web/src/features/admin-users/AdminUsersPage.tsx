import { Select, TextInput } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { CrudPage } from '@web/components/crud/CrudPage';
import { DeleteAction } from '@web/components/crud/DeleteAction';
import { ListingSort } from '@web/components/crud/ListingSort';
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
        { label: 'Username', render: (row) => row.username },
        { label: 'Email', render: (row) => row.email },
        {
          label: 'Status',
          render: (row) => (row.isActive ? 'Aktif' : 'Tidak aktif'),
        },
      ]}
      addAction={
        access.create && <Link to="/admin-users/add">Tambah administrator</Link>
      }
      filters={
        <>
          <TextInput
            label="Username"
            value={users.queries.username ?? ''}
            onChange={(e) => {
              const value = e.currentTarget.value || undefined;
              users.setQueries((current) => ({
                ...current,
                username: value,
                page: 1,
              }));
            }}
          />
          <TextInput
            label="Email"
            value={users.queries.email ?? ''}
            onChange={(e) => {
              const value = e.currentTarget.value || undefined;
              users.setQueries((current) => ({
                ...current,
                email: value,
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
          <ListingSort
            value={users.queries.sortBy}
            direction={users.queries.sortDirection}
            options={[
              { value: 'createdAt', label: 'Tanggal dibuat' },
              { value: 'username', label: 'Username' },
              { value: 'email', label: 'Email' },
              { value: 'isActive', label: 'Status' },
            ]}
            onSort={(value) =>
              users.setQueries((current) => ({
                ...current,
                sortBy: value,
                page: 1,
              }))
            }
            onDirection={(value) =>
              users.setQueries((current) => ({
                ...current,
                sortDirection: value,
                page: 1,
              }))
            }
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
