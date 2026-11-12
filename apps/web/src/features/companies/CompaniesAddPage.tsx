import { CrudPage } from '@web/components/crud/CrudPage';
import { useSession } from '@web/features/auth/hooks/useSession';
import { CompanyForm } from '@web/features/companies/components/CompanyForm';

export function CompaniesAddPage() {
  const { session } = useSession();
  return (
    <CrudPage program="USC" action="create" title="Tambah perusahaan">
      <CompanyForm token={session?.authToken ?? ''} />
    </CrudPage>
  );
}
