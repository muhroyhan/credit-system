import { Group, Select, TextInput } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { CrudPage } from '@web/components/crud/CrudPage';
import { DeleteAction } from '@web/components/crud/DeleteAction';
import { ListingTable } from '@web/components/crud/ListingTable';
import { useSession } from '@web/features/auth/hooks/useSession';
import { useCompanies } from '@web/features/companies/hooks/useCompanies';
import { useEntities } from '@web/features/companies/hooks/useEntities';
import { crudaAccess } from '@web/utils/cruda';

export function CompaniesPage() {
  return (
    <CrudPage program="USC" action="read" title="Perusahaan">
      <Listing />
    </CrudPage>
  );
}
function Listing() {
  const { session } = useSession();
  const access = crudaAccess(session, 'USC');
  const users = useCompanies(session?.authToken ?? '');
  const entity = useEntities(session?.authToken ?? '');
  return (
    <>
      <Link to="/">Beranda</Link>
      <ListingTable
        rows={users.list.data?.data ?? []}
        loading={users.list.isFetching}
        error={
          (
            users.list.error ??
            users.remove.error ??
            users.exporting.error ??
            entity.error
          )?.message
        }
        page={users.page}
        total={users.list.data?.count ?? 0}
        onPageChange={users.setPage}
        exporting={users.exporting.isPending}
        onExport={(format) => users.exporting.mutate(format)}
        columns={[
          { label: 'Badan usaha', render: (row) => row.entityType },
          { label: 'Nama', render: (row) => row.companyName },
          { label: 'Username', render: (row) => row.username },
          { label: 'Email', render: (row) => row.email },
          { label: 'Slug', render: (row) => row.slug },
          { label: 'Status', render: (row) => row.status },
        ]}
        addAction={
          access.create && <Link to="/companies/add">Tambah perusahaan</Link>
        }
        filters={
          <Group>
            {(['companyName', 'username', 'email'] as const).map((name, i) => (
              <TextInput
                key={name}
                label={['Nama perusahaan', 'Username', 'Email'][i]}
                value={users.filters[name]}
                onChange={(e) => users.filter(name, e.currentTarget.value)}
              />
            ))}
            <Select
              label="Badan usaha"
              clearable
              data={(entity.data ?? []).map((v) => ({
                value: String(v.id),
                label: v.value ?? String(v.id),
              }))}
              value={users.filters.entityTypeId || null}
              onChange={(v) => users.filter('entityTypeId', v ?? '')}
            />
            <Select
              label="Status"
              clearable
              data={['active', 'inactive', 'blocked']}
              value={users.filters.status || null}
              onChange={(v) => users.filter('status', v ?? '')}
            />
            <Select
              label="Urutkan"
              data={['createdAt', 'companyName', 'username', 'email', 'status']}
              value={users.filters.sortBy}
              onChange={(v) => {
                if (v) {
                  users.filter('sortBy', v);
                }
              }}
            />
            <Select
              label="Arah"
              data={['asc', 'desc']}
              value={users.filters.sortDirection}
              onChange={(v) => {
                if (v) {
                  users.filter('sortDirection', v);
                }
              }}
            />
          </Group>
        }
        actions={(v) => (
          <>
            <Link to="/companies/$id" params={{ id: String(v.id) }}>
              Lihat
            </Link>
            {access.update && (
              <Link to="/companies/$id/edit" params={{ id: String(v.id) }}>
                Ubah
              </Link>
            )}
            <DeleteAction
              allowed={access.delete}
              pending={users.remove.isPending}
              message="Hapus perusahaan ini?"
              onDelete={() => users.remove.mutate(v.id)}
            />
          </>
        )}
      />
    </>
  );
}
