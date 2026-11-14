import { AccountTypeEnum, CreditStatusEnum } from '@credit/contracts';
import { Alert, Button, Group } from '@mantine/core';
import { Link, useParams } from '@tanstack/react-router';
import { CrudPage } from '@web/components/crud/CrudPage';
import { DetailFields } from '@web/components/crud/DetailFields';
import { RecordState } from '@web/components/crud/RecordState';
import { StatusBadge } from '@web/components/StatusBadge';
import { useSession } from '@web/features/auth/hooks/useSession';
import { CustomerCreditStatus } from '@web/features/credit/components/CustomerCreditStatus';
import { useCreditApproval } from '@web/features/credit/hooks/useCreditApproval';
import { useCreditDetail } from '@web/features/credit/hooks/useCreditDetail';
import { crudaAccess } from '@web/utils/cruda';
import { formatMoney } from '@web/utils/format-money';
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
            title="Ringkasan pengajuan"
            fields={[
              { label: 'Nama', value: row.nama },
              { label: 'Perusahaan', value: row.companyName },
              {
                label: 'Nominal',
                value: formatMoney(row.credit.jumlahPengajuan),
              },
              { label: 'Tenor', value: row.credit.jangkaWaktuBulan },
              {
                label: 'Angsuran',
                value: formatMoney(row.credit.jumlahAngsuran),
              },
              {
                label: 'Tanggal pengajuan',
                value: row.credit.tanggalPengajuan,
              },
              {
                label: 'Status HRD',
                value: <StatusBadge value={row.credit.status} />,
              },
              {
                label: 'Status BPR',
                value: <StatusBadge value={row.credit.statusAdminApproval} />,
              },
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
            <Alert color="red.8">{approval.error.message}</Alert>
          )}
          {session?.type === AccountTypeEnum.Company &&
            crudaAccess(session, 'CGP').approve &&
            row.credit.status === CreditStatusEnum.Pending && (
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
                  color="red.8"
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
          {session?.type === AccountTypeEnum.Debitor && (
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
