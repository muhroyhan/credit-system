import { Link, useParams } from '@tanstack/react-router';
import { CrudPage } from '@web/components/crud/CrudPage';
import { DetailFields } from '@web/components/crud/DetailFields';
import { RecordState } from '@web/components/crud/RecordState';
import { useSession } from '@web/features/auth/hooks/useSession';
import { useCreditReview } from '@web/features/credit-review/hooks/useCreditReview';
import { crudaAccess } from '@web/utils/cruda';
export function CreditorReviewViewPage() {
  return (
    <CrudPage program="DKN" action="read" title="Review Kredit">
      <Content />
    </CrudPage>
  );
}
function Content() {
  const { id } = useParams({ from: '/credit-reviews/$id' });
  const { session } = useSession();
  const token = session?.authToken ?? '';
  const query = useCreditReview(token, Number(id));
  return (
    <RecordState id={Number(id)} query={query}>
      {(row) => (
        <>
          <DetailFields
            fields={[
              { label: 'Nama', value: row.nama },
              { label: 'NIK', value: row.noKtp },
              { label: 'Perusahaan', value: row.companyName },
              { label: 'Nominal', value: row.credit.jumlahPengajuan },
              { label: 'Tenor', value: row.credit.jangkaWaktuBulan },
              { label: 'Angsuran', value: row.credit.jumlahAngsuran },
              { label: 'Status HRD', value: row.credit.status },
              { label: 'Status BPR', value: row.credit.statusAdminApproval },
              { label: 'Pengajuan terbuka', value: row.summary?.open },
              { label: 'Score informatif', value: row.summary?.score },
            ]}
          />
          {row.expenses.map((expense) => (
            <DetailFields
              key={expense.id}
              fields={[
                {
                  label: expense.expenseName ?? 'Biaya',
                  value: expense.amount,
                },
              ]}
            />
          ))}
          {crudaAccess(session, 'DKN').approve &&
            row.credit.status === 'approved' &&
            row.credit.statusAdminApproval !== 'rejected' &&
            row.credit.statusAdminApproval !== 'completed' && (
              <Link to="/credit-reviews/$id/edit" params={{ id }}>
                Ubah keputusan
              </Link>
            )}
          <Link to="/credit-reviews">Kembali</Link>
        </>
      )}
    </RecordState>
  );
}
