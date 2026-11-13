import { CompanyStatusEnum } from '@credit/contracts';
import { Select, TextInput } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { CrudPage } from '@web/components/crud/CrudPage';
import { DeleteAction } from '@web/components/crud/DeleteAction';
import { ListingSort } from '@web/components/crud/ListingSort';
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
      page={users.queries.page}
      total={users.list.data?.count ?? 0}
      onPageChange={(page) =>
        users.setQueries((current) => ({ ...current, page }))
      }
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
        <>
          {(['companyName', 'username', 'email'] as const).map((name, i) => (
            <TextInput
              key={name}
              label={['Nama perusahaan', 'Username', 'Email'][i]}
              value={users.queries[name] ?? ''}
              onChange={(e) => {
                const value = e.currentTarget.value || undefined;
                users.setQueries((current) => ({
                  ...current,
                  [name]: value,
                  page: 1,
                }));
              }}
            />
          ))}
          <Select
            label="Badan usaha"
            clearable
            data={(entity.data ?? []).map((v) => ({
              value: String(v.id),
              label: v.value ?? String(v.id),
            }))}
            value={users.queries.entityTypeId || null}
            onChange={(v) =>
              users.setQueries((current) => ({
                ...current,
                entityTypeId: v ?? undefined,
                page: 1,
              }))
            }
          />
          <Select
            label="Status"
            clearable
            data={Object.values(CompanyStatusEnum)}
            value={users.queries.status || null}
            onChange={(v) =>
              users.setQueries((current) => ({
                ...current,
                status: v ?? undefined,
                page: 1,
              }))
            }
          />
          <ListingSort
            value={users.queries.sortBy}
            direction={users.queries.sortDirection}
            options={[
              'createdAt',
              'companyName',
              'username',
              'email',
              'status',
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
  );
}
