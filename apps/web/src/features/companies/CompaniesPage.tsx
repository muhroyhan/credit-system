import { CompanyStatusEnum } from '@credit/contracts';
import { Button, Select, TextInput } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { CrudPage } from '@web/components/crud/CrudPage';
import { DeleteAction } from '@web/components/crud/DeleteAction';
import { ListingTable } from '@web/components/crud/ListingTable';
import { StatusBadge } from '@web/components/StatusBadge';
import { statusPresentation } from '@web/constant/constant';
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
        {
          label: 'Badan usaha',
          sortKey: 'entityType',
          render: (row) => row.entityType,
        },
        {
          label: 'Nama',
          sortKey: 'companyName',
          render: (row) => row.companyName,
        },
        {
          label: 'Username',
          sortKey: 'username',
          render: (row) => row.username,
        },
        { label: 'Email', sortKey: 'email', render: (row) => row.email },
        { label: 'Slug', sortKey: 'slug', render: (row) => row.slug },
        {
          label: 'Status',
          sortKey: 'status',
          render: (row) => <StatusBadge value={row.status} />,
        },
      ]}
      addAction={
        access.create && (
          <Button component={Link} to="/companies/add">
            Tambah perusahaan
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
            label="Cari: Nama perusahaan / Username / Email"
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
            data={Object.values(CompanyStatusEnum).map((value) => ({
              value,
              label: statusPresentation[value]?.label ?? value,
            }))}
            value={users.queries.status || null}
            onChange={(v) =>
              users.setQueries((current) => ({
                ...current,
                status: v ?? undefined,
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
