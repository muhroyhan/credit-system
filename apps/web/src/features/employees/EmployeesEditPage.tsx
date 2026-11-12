import { Link, useParams } from '@tanstack/react-router';
import { CrudPage } from '@web/components/crud/CrudPage';
import { RecordState } from '@web/components/crud/RecordState';
import { useSession } from '@web/features/auth/hooks/useSession';
import { EmployeeDocumentsForm } from '@web/features/employees/components/EmployeeDocumentsForm';
import { EmployeeForm } from '@web/features/employees/components/EmployeeForm';
import { EmployeeProfileForm } from '@web/features/employees/components/EmployeeProfileForm';
import { useEmployeeDetail } from '@web/features/employees/hooks/useEmployeeDetail';
export function EmployeesEditPage() {
  return (
    <CrudPage program="CGP" action="update" title="Ubah karyawan">
      <Content />
    </CrudPage>
  );
}
function Content() {
  const { id } = useParams({ from: '/employees/$id/edit' });
  const { session } = useSession();
  const token = session?.authToken ?? '';
  const query = useEmployeeDetail(token, Number(id));
  return (
    <RecordState id={Number(id)} query={query}>
      {(data) => (
        <>
          <EmployeeForm token={token} id={data.id} initial={data} />
          <EmployeeProfileForm token={token} data={data} />
          <EmployeeDocumentsForm token={token} data={data} />
          <Link to="/employees">Kembali</Link>
        </>
      )}
    </RecordState>
  );
}
