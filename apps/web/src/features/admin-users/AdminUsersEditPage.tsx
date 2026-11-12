import { useParams } from "@tanstack/react-router";
import { CrudPage } from "@web/components/crud/CrudPage";
import { RecordState } from "@web/components/crud/RecordState";
import { AdminUserForm } from "@web/features/admin-users/components/AdminUserForm";
import { useAdminDetail } from "@web/features/admin-users/hooks/useAdminDetail";
import { useSession } from "@web/features/auth/hooks/useSession";
export function AdminUsersEditPage() {
  return (
    <CrudPage program="USA" action="update" title="Ubah administrator">
      <EditContent />
    </CrudPage>
  );
}
function EditContent() {
  const { session } = useSession();
  const { id } = useParams({ from: "/admin-users/$id/edit" });
  const query = useAdminDetail(session?.authToken ?? "", Number(id));

  return (
    <RecordState id={Number(id)} query={query}>
      {(data) => (
        <>
          <AdminUserForm
            key={id}
            token={session?.authToken ?? ""}
            id={Number(id)}
            initial={{
              username: data.username ?? "",
              email: data.email ?? "",
              isActive: !!data.isActive,
              roles: data.roles ?? [],
            }}
          />
        </>
      )}
    </RecordState>
  );
}
