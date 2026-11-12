import { Alert, Container, Text, Title } from "@mantine/core";
import { useParams } from "@tanstack/react-router";
import { AccessGate } from "@web/components/AccessGate";
import { useSession } from "@web/features/auth/hooks/useSession";
import { CompanyForm } from "@web/features/companies/components/CompanyForm";
import {
  useCompanyDetail,
  useEntities,
} from "@web/features/companies/hooks/useCompanies";
export function CompaniesEditPage() {
  return (
    <AccessGate program="USC" action="update">
      <Content />
    </AccessGate>
  );
}
function Content() {
  const { session } = useSession();
  const token = session?.authToken ?? "";
  const { id } = useParams({ from: "/companies/$id/edit" });
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
      <Title>Ubah perusahaan</Title>
      <CompanyForm
        token={token}
        id={Number(id)}
        initial={{
          entityTypeId: data.entityTypeId ?? 0,
          companyName: data.companyName ?? "",
          username: data.username ?? "",
          email: data.email ?? "",
          slug: data.slug ?? "",
          status: data.status ?? "inactive",
          bungaKredits: data.bungaKredits,
          biaya: data.biaya,
        }}
      />
    </Container>
  );
}
