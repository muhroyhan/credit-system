import { Link } from '@tanstack/react-router';
import { CrudPage } from '@web/components/crud/CrudPage';
import { useSession } from '@web/features/auth/hooks/useSession';
import { EmployeeForm } from '@web/features/employees/components/EmployeeForm';
export function EmployeesAddPage() {
  const { session } = useSession();
  return (
    <CrudPage program="CGP" action="create" title="Tambah karyawan">
      <EmployeeForm token={session?.authToken ?? ''} />
      <Link to="/employees">Kembali</Link>
    </CrudPage>
  );
}
