import { Container, Stack, Title } from "@mantine/core";
import { AccessGate } from "@web/components/AccessGate";
import { AdminUserForm } from "@web/features/admin-users/components/AdminUserForm";
import { useSession } from "@web/features/auth/hooks/useSession";
export function AdminUsersAddPage() {
  const { session } = useSession();
  return (
    <AccessGate program="USA" action="create">
      <Container>
        <Stack>
          <Title>Tambah administrator</Title>
          <AdminUserForm token={session?.authToken ?? ""} />
        </Stack>
      </Container>
    </AccessGate>
  );
}
