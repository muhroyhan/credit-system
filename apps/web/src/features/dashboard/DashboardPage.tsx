import {
  Alert,
  Container,
  Paper,
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
    <Container size="xl" px={0}>
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
      <Alert color="red.8">Gagal memuat ringkasan: {query.error.message}</Alert>
    );
  }
  const money = (value: string) =>
    `Rp ${new Intl.NumberFormat('id-ID').format(BigInt(value))}`;
  return (
    <SimpleGrid type="container" cols={{ base: 1, '580px': 2, '900px': 3 }}>
      {[
        {
          label: 'Perusahaan aktif dan nonaktif',
          value: query.data.totalUsers,
        },
        { label: 'Jumlah debitor', value: query.data.totalDebitor },
        {
          label: 'Pengajuan pending',
          value: money(query.data.totalCredits.pending),
        },
        {
          label: 'Pengajuan approved',
          value: money(query.data.totalCredits.approved),
        },
        {
          label: 'Pengajuan completed',
          value: money(query.data.totalCredits.completed),
        },
      ].map(({ label, value }) => (
        <Paper key={label} p="lg" radius="md" withBorder>
          <Text size="sm" c="dimmed">
            {label}:{' '}
            <Text
              component="span"
              display="block"
              size="xl"
              fw={700}
              c="#333333"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {value}
            </Text>
          </Text>
        </Paper>
      ))}
    </SimpleGrid>
  );
}
