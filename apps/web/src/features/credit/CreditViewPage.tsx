import { Alert, Button, Group } from '@mantine/core';
import { Link, useParams } from '@tanstack/react-router';
import { CrudPage } from '@web/components/crud/CrudPage';
import { DetailFields } from '@web/components/crud/DetailFields';
import { RecordState } from '@web/components/crud/RecordState';
import { useSession } from '@web/features/auth/hooks/useSession';
import { CustomerCreditStatus } from '@web/features/credit/components/CustomerCreditStatus';
import { useCreditApproval } from '@web/features/credit/hooks/useCreditApproval';
import { useCreditDetail } from '@web/features/credit/hooks/useCreditDetail';
import { crudaAccess } from '@web/utils/cruda';
export function CreditViewPage() {
  return (
    <CrudPage program="CGP" action="read" title="Detail pengajuan">
      <Content />
    </CrudPage>
  );
}
function Content() {
  const { id } = useParams({ from: '/credits/$id' });
  const { session } = useSession();
  const query = useCreditDetail(session?.authToken ?? '', Number(id));
  const approval = useCreditApproval(session?.authToken ?? '');
  return (
    <RecordState id={Number(id)} query={query}>
      {(row) => (
        <>
          <DetailFields
            fields={[
              { label: 'Nama', value: row.nama },
              { label: 'Perusahaan', value: row.companyName },
              { label: 'Nominal', value: row.credit.jumlahPengajuan },
              { label: 'Tenor', value: row.credit.jangkaWaktuBulan },
              { label: 'Angsuran', value: row.credit.jumlahAngsuran },
              {
                label: 'Tanggal pengajuan',
                value: row.credit.tanggalPengajuan,
              },
              { label: 'Status HRD', value: row.credit.status },
              { label: 'Status BPR', value: row.credit.statusAdminApproval },
              {
                label: 'Tanggal persetujuan nasabah',
                value: row.credit.debitorAcknowledgmentTimestamp,
              },
            ]}
          />
          {approval.isSuccess && (
            <Alert color="green">Keputusan HRD tersimpan</Alert>
          )}
          {approval.error && (
            <Alert color="red">{approval.error.message}</Alert>
          )}
          {session?.type === 'company' &&
            crudaAccess(session, 'CGP').approve &&
            row.credit.status === 'pending' && (
              <Group>
                <Button
                  disabled={approval.isPending}
                  onClick={() => {
                    if (window.confirm('Setujui pengajuan ini?')) {
                      approval.mutate({
                        id: row.credit.id,
                        status: 'approved',
                      });
                    }
                  }}
                >
                  Setujui
                </Button>
                <Button
                  color="red"
                  disabled={approval.isPending}
                  onClick={() => {
                    if (window.confirm('Tolak pengajuan ini?')) {
                      approval.mutate({
                        id: row.credit.id,
                        status: 'rejected',
                      });
                    }
                  }}
                >
                  Tolak
                </Button>
              </Group>
            )}
          {session?.type === 'debitor' && (
            <CustomerCreditStatus
              token={session.authToken}
              id={row.credit.id}
            />
          )}
          <Link to="/credits">Kembali</Link>
        </>
      )}
    </RecordState>
  );
}
