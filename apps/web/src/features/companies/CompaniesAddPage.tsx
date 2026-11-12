import { Container, Title } from "@mantine/core";
import { AccessGate } from "@web/components/AccessGate";
import { useSession } from "@web/features/auth/hooks/useSession";
import { CompanyForm } from "@web/features/companies/components/CompanyForm";
export function CompaniesAddPage() {
  const { session } = useSession();
  return (
    <AccessGate program="USC" action="create">
      <Container>
        <Title>Tambah perusahaan</Title>
        <CompanyForm token={session?.authToken ?? ""} />
      </Container>
    </AccessGate>
  );
}
