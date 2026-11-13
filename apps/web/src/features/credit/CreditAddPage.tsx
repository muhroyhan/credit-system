import { AccountTypeEnum } from '@credit/contracts';
import { Link } from '@tanstack/react-router';
import { CrudPage } from '@web/components/crud/CrudPage';
import { useSession } from '@web/features/auth/hooks/useSession';
import { CreditForm } from '@web/features/credit/components/CreditForm';
export function CreditAddPage() {
  const { session } = useSession();
  return (
    <CrudPage
      program="CGP"
      action={session?.type === AccountTypeEnum.Debitor ? 'read' : 'create'}
      title="Tambah pengajuan"
    >
      <CreditForm
        token={session?.authToken ?? ''}
        debitorId={
          session?.type === AccountTypeEnum.Debitor ? session.userData.id : 0
        }
        self={session?.type === AccountTypeEnum.Debitor}
      />
      <Link to="/credits">Kembali</Link>
    </CrudPage>
  );
}
