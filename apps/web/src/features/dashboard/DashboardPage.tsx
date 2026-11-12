import { Button, Container, Stack, Text, Title } from "@mantine/core";
import { Navigate } from "@tanstack/react-router";
import { AdminUsersPage } from "@web/features/admin-users/AdminUsersPage";
import { useSession } from "@web/features/auth/hooks/useSession";
export function DashboardPage() {
  const { session, logout } = useSession();
  if (!session) return <Navigate to="/login" replace />;
  return (
    <Container>
      <Stack>
        <Text>Beranda</Text>
        <Title>Credit System</Title>
        <Text>Masuk sebagai {session.type}</Text>
        <AdminUsersPage embedded />
        <Button onClick={logout}>Keluar</Button>
      </Stack>
    </Container>
  );
}
