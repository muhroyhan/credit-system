import {
  Alert,
  Container,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Navigate } from '@tanstack/react-router';
import { useSession } from '@web/features/auth/hooks/useSession';
import { useDashboard } from '@web/features/dashboard/hooks/useDashboard';

export function DashboardPage() {
  const { session } = useSession();
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return (
    <Container>
      <Stack>
        <Text>Beranda</Text>
        <Title>Credit System</Title>
        <Text>Masuk sebagai {session.type}</Text>
        <DashboardSummary token={session.authToken} />
      </Stack>
    </Container>
  );
}

function DashboardSummary({ token }: { token: string }) {
  const query = useDashboard(token);
  if (query.isPending) {
    return <Text>Memuat ringkasan...</Text>;
  }
  if (query.error) {
    return (
      <Alert color="red">Gagal memuat ringkasan: {query.error.message}</Alert>
    );
  }
  const money = (value: string) =>
    `Rp ${new Intl.NumberFormat('id-ID').format(BigInt(value))}`;
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
      <Text>Perusahaan aktif dan nonaktif: {query.data.totalUsers}</Text>
      <Text>Jumlah debitor: {query.data.totalDebitor}</Text>
      <Text>Pengajuan pending: {money(query.data.totalCredits.pending)}</Text>
      <Text>Pengajuan approved: {money(query.data.totalCredits.approved)}</Text>
      <Text>
        Pengajuan completed: {money(query.data.totalCredits.completed)}
      </Text>
    </SimpleGrid>
  );
}
