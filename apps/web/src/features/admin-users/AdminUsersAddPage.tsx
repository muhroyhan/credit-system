import { CrudPage } from "@web/components/crud/CrudPage";
import { AdminUserForm } from "@web/features/admin-users/components/AdminUserForm";
import { useSession } from "@web/features/auth/hooks/useSession";
export function AdminUsersAddPage() {
  const { session } = useSession();
  return (
    <CrudPage program="USA" action="create" title="Tambah administrator">
      <AdminUserForm token={session?.authToken ?? ""} />
    </CrudPage>
  );
}
