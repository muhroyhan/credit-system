import { Alert, Container, Stack, Text, Title } from "@mantine/core";
import { Link, useParams } from "@tanstack/react-router";
import { AccessGate } from "@web/components/AccessGate";
import { useSession } from "@web/features/auth/hooks/useSession";
import {
  useCompanyDetail,
  useEntities,
} from "@web/features/companies/hooks/useCompanies";
export function CompaniesViewPage() {
  return (
    <AccessGate program="USC" action="read">
      <Content />
    </AccessGate>
  );
}
function Content() {
  const { session } = useSession();
  const token = session?.authToken ?? "";
  const { id } = useParams({ from: "/companies/$id" });
  const query = useCompanyDetail(token, Number(id));
  const entity = useEntities(token);
  if (!Number.isInteger(Number(id)) || Number(id) <= 0)
    return <Alert color="red">ID tidak valid</Alert>;
  if (query.isPending || entity.isPending) return <Text>Memuat...</Text>;
  if (query.error || entity.error)
    return <Alert color="red">{(query.error ?? entity.error)?.message}</Alert>;
  const data = query.data;
  return (
    <Container>
      <Stack>
        <Title>Detail perusahaan</Title>
        <Text>
          Badan usaha:{" "}
          {entity.data?.find((e) => e.id === data.entityTypeId)?.value ??
            data.entityTypeId}
        </Text>
        <Text>Nama perusahaan: {data.companyName}</Text>
        <Text>Username: {data.username}</Text>
        <Text>Email: {data.email}</Text>
        <Text>Slug: {data.slug}</Text>
        <Text>Status: {data.status}</Text>
        <Title order={2}>Bunga per tenor</Title>
        {data.bungaKredits.map((v) => (
          <Text key={v.id}>
            {v.jangkaWaktuBulan} bulan: {v.bungaPercentage}%
          </Text>
        ))}
        <Title order={2}>Biaya</Title>
        {data.biaya.map((v) => (
          <Text key={v.id}>
            {v.expenseType}: {v.value} ({v.type})
          </Text>
        ))}
        <Link to="/companies">Kembali</Link>
      </Stack>
    </Container>
  );
}
