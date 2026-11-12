import { Alert, Container, Stack, Text, Title } from "@mantine/core";
import { Link, useParams } from "@tanstack/react-router";
import { AccessGate } from "@web/components/AccessGate";
import { AdminUserForm } from "@web/features/admin-users/components/AdminUserForm";
import { useAdminDetail } from "@web/features/admin-users/hooks/useAdminDetail";
import { useSession } from "@web/features/auth/hooks/useSession";
export function AdminUsersEditPage() {
  return (
    <AccessGate program="USA" action="update">
      <EditContent />
    </AccessGate>
  );
}
function EditContent() {
  const { session } = useSession();
  const { id } = useParams({ from: "/admin-users/$id/edit" });
  const query = useAdminDetail(session?.authToken ?? "", Number(id));
  if (!Number.isInteger(Number(id)) || Number(id) <= 0)
    return <Alert color="red">ID tidak valid</Alert>;
  if (query.isPending) return <Text>Memuat...</Text>;
  if (query.error)
    return (
      <Alert color="red">
        {query.error.message}
        <Link to="/admin-users">Kembali</Link>
      </Alert>
    );
  const data = query.data;
  return (
    <Container>
      <Stack>
        <Title>Ubah administrator</Title>
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
      </Stack>
    </Container>
  );
}
