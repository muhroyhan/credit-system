import { Alert } from '@mantine/core';
import { Link, useParams } from '@tanstack/react-router';
import { CrudPage } from '@web/components/crud/CrudPage';
import { RecordState } from '@web/components/crud/RecordState';
import { useSession } from '@web/features/auth/hooks/useSession';
import { CreditForm } from '@web/features/credit/components/CreditForm';
import { useCreditDetail } from '@web/features/credit/hooks/useCreditDetail';
export function CreditEditPage() {
  return (
    <CrudPage program="CGP" action="update" title="Ubah pengajuan">
      <Content />
    </CrudPage>
  );
}
function Content() {
  const { id } = useParams({ from: '/credits/$id/edit' });
  const { session } = useSession();
  const token = session?.authToken ?? '';
  const query = useCreditDetail(token, Number(id));
  return (
    <RecordState id={Number(id)} query={query}>
      {(row) => (
        <>
          {row.credit.status === 'approved' ||
          row.credit.status === 'rejected' ? (
            <Alert>Pengajuan sudah terkunci</Alert>
          ) : (
            <CreditForm
              token={token}
              debitorId={row.credit.debitorId ?? 0}
              row={row}
              self={session?.type === 'debitor'}
            />
          )}
          <Link to="/credits">Kembali</Link>
        </>
      )}
    </RecordState>
  );
}
