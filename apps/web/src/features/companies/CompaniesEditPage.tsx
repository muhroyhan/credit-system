import { useParams } from '@tanstack/react-router';
import { CrudPage } from '@web/components/crud/CrudPage';
import { RecordState } from '@web/components/crud/RecordState';
import { useSession } from '@web/features/auth/hooks/useSession';
import { CompanyForm } from '@web/features/companies/components/CompanyForm';
import { useCompanyDetail } from '@web/features/companies/hooks/useCompanyDetail';
import { useEntities } from '@web/features/companies/hooks/useEntities';

export function CompaniesEditPage() {
  return (
    <CrudPage program="USC" action="update" title="Ubah perusahaan">
      <Content />
    </CrudPage>
  );
}
function Content() {
  const { session } = useSession();
  const token = session?.authToken ?? '';
  const { id } = useParams({ from: '/companies/$id/edit' });
  const query = useCompanyDetail(token, Number(id));
  const entity = useEntities(token);

  return (
    <RecordState
      id={Number(id)}
      query={query}
      pending={entity.isPending}
      error={entity.error}
    >
      {(data) => (
        <>
          <CompanyForm
            token={token}
            id={Number(id)}
            initial={{
              entityTypeId: data.entityTypeId ?? 0,
              companyName: data.companyName ?? '',
              username: data.username ?? '',
              email: data.email ?? '',
              slug: data.slug ?? '',
              status: data.status ?? 'inactive',
              bungaKredits: data.bungaKredits,
              biaya: data.biaya,
            }}
          />
        </>
      )}
    </RecordState>
  );
}
