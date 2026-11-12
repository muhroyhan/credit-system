import { Alert, Container, Stack, Text, Title } from "@mantine/core";
import { Link, useParams } from "@tanstack/react-router";
import { AccessGate } from "@web/components/AccessGate";
import {
  useAdminDetail,
  useAdminPrograms,
} from "@web/features/admin-users/hooks/useAdminDetail";
import { useSession } from "@web/features/auth/hooks/useSession";
export function AdminUsersViewPage() {
  return (
    <AccessGate program="USA" action="read">
      <ViewContent />
    </AccessGate>
  );
}
function ViewContent() {
  const { session } = useSession();
  const { id } = useParams({ from: "/admin-users/$id" });
  const query = useAdminDetail(session?.authToken ?? "", Number(id));
  const programs = useAdminPrograms(session?.authToken ?? "");
  if (!Number.isInteger(Number(id)) || Number(id) <= 0)
    return <Alert color="red">ID tidak valid</Alert>;
  if (query.isPending || programs.isPending) return <Text>Memuat...</Text>;
  if (query.error || programs.error)
    return (
      <Alert color="red">{(query.error ?? programs.error)?.message}</Alert>
    );
  const data = query.data;
  return (
    <Container>
      <Stack>
        <Title>Detail administrator</Title>
        <Text>Username: {data.username ?? "—"}</Text>
        <Text>Email: {data.email ?? "—"}</Text>
        <Text>Status: {data.isActive ? "Aktif" : "Tidak aktif"}</Text>
        <Title order={2}>Hak akses</Title>
        {data.roles?.length ? (
          data.roles.map((role) => (
            <Text key={role.programId}>
              {programs.data?.find((p) => p.id === role.programId)?.name ??
                `Program ${role.programId}`}
              : {role.value}
            </Text>
          ))
        ) : (
          <Text>Tidak ada hak akses</Text>
        )}
        <Link to="/admin-users">Kembali</Link>
      </Stack>
    </Container>
  );
}
