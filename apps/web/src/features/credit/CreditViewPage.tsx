import { Link, useParams } from '@tanstack/react-router';
import { CrudPage } from '@web/components/crud/CrudPage';
import { DetailFields } from '@web/components/crud/DetailFields';
import { RecordState } from '@web/components/crud/RecordState';
import { useSession } from '@web/features/auth/hooks/useSession';
import { useCreditDetail } from '@web/features/credit/hooks/useCreditDetail';
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
          <Link to="/credits">Kembali</Link>
        </>
      )}
    </RecordState>
  );
}
