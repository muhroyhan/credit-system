import { CreditStatusEnum } from '@credit/contracts';
import { Alert, Button, Text } from '@mantine/core';
import { Link, useParams } from '@tanstack/react-router';
import { CrudPage } from '@web/components/crud/CrudPage';
import { RecordState } from '@web/components/crud/RecordState';
import { useSession } from '@web/features/auth/hooks/useSession';
import { useAgreementDownload } from '@web/features/credit/hooks/useAgreementDownload';
import { useCreditDetail } from '@web/features/credit/hooks/useCreditDetail';
export function CreditThanksPage() {
  return (
    <CrudPage program="CGP" action="read" title="Terima kasih">
      <Content />
    </CrudPage>
  );
}
function Content() {
  const { id } = useParams({ from: '/credits/$id/thanks' });
  const { session } = useSession();
  const query = useCreditDetail(session?.authToken ?? '', Number(id));
  const download = useAgreementDownload(session?.authToken ?? '', Number(id));
  return (
    <RecordState id={Number(id)} query={query}>
      {(row) => (
        <>
          {row.credit.debitorAcknowledgmentTimestamp &&
          row.credit.statusAdminApproval === CreditStatusEnum.Approved &&
          row.credit.docUrl ? (
            <>
              <Text>Konfirmasi Anda telah tersimpan dan dokumen tersedia.</Text>
              <Text>Nomor: {row.credit.agreementNumber}</Text>
              <Button
                loading={download.isPending}
                onClick={() => download.mutate()}
              >
                Unduh perjanjian
              </Button>
              {download.error && (
                <Alert color="red.8">{download.error.message}</Alert>
              )}
            </>
          ) : (
            <Alert>
              Dokumen belum tersedia. Kembali ke detail untuk melanjutkan.
            </Alert>
          )}
          <Link to="/credits/$id" params={{ id }}>
            Kembali ke detail
          </Link>
        </>
      )}
    </RecordState>
  );
}
