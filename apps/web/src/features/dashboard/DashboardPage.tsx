import { Button, Container, Stack, Text, Title } from "@mantine/core";
import { Link, Navigate } from "@tanstack/react-router";
import { useSession } from "@web/features/auth/hooks/useSession";
import { crudaAccess } from "@web/utils/cruda";
export function DashboardPage() {
  const { session, logout } = useSession();
  if (!session) return <Navigate to="/login" replace />;
  return (
    <Container>
      <Stack>
        <Text>Beranda</Text>
        <Title>Credit System</Title>
        <Text>Masuk sebagai {session.type}</Text>
        {crudaAccess(session, "USA").read && (
          <Link to="/admin-users">Admin User</Link>
        )}
        <Button onClick={logout}>Keluar</Button>
      </Stack>
    </Container>
  );
}
