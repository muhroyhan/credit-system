import { Group, Select, TextInput } from '@mantine/core';
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
    <>
      <Link to="/">Beranda</Link>
      <ListingTable
        rows={users.rows}
        loading={users.loading}
        error={users.error}
        page={users.page}
        total={users.total}
        onPageChange={users.setPage}
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
          access.create && (
            <Link to="/admin-users/add">Tambah administrator</Link>
          )
        }
        filters={
          <Group>
            <TextInput
              label="Username"
              value={users.username}
              onChange={(e) => {
                users.setUsername(e.currentTarget.value);
                users.setPage(1);
              }}
            />
            <TextInput
              label="Email"
              value={users.email}
              onChange={(e) => {
                users.setEmail(e.currentTarget.value);
                users.setPage(1);
              }}
            />
            <Select
              label="Status"
              clearable
              value={users.active}
              onChange={(v) => {
                users.setActive(v);
                users.setPage(1);
              }}
              data={[
                { value: 'true', label: 'Aktif' },
                { value: 'false', label: 'Tidak aktif' },
              ]}
            />
            <Select
              label="Urutkan"
              value={users.sortBy}
              allowDeselect={false}
              onChange={(v) => {
                if (v) {
                  users.setSortBy(v);
                }
                users.setPage(1);
              }}
              data={[
                { value: 'createdAt', label: 'Tanggal dibuat' },
                { value: 'username', label: 'Username' },
                { value: 'email', label: 'Email' },
                { value: 'isActive', label: 'Status' },
              ]}
            />
            <Select
              label="Arah urutan"
              value={users.sortDirection}
              allowDeselect={false}
              onChange={(v) => {
                if (v) {
                  users.setSortDirection(v);
                }
                users.setPage(1);
              }}
              data={[
                { value: 'asc', label: 'Naik' },
                { value: 'desc', label: 'Turun' },
              ]}
            />
          </Group>
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
    </>
  );
}
