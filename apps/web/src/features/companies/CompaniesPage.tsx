import {
  Alert,
  Button,
  Container,
  Group,
  NumberInput,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { AccessGate } from "@web/components/AccessGate";
import { useSession } from "@web/features/auth/hooks/useSession";
import {
  useCompanies,
  useEntities,
} from "@web/features/companies/hooks/useCompanies";
import { crudaAccess } from "@web/utils/cruda";
export function CompaniesPage() {
  return (
    <AccessGate program="USC" action="read">
      <Listing />
    </AccessGate>
  );
}
function Listing() {
  const { session } = useSession();
  const access = crudaAccess(session, "USC");
  const users = useCompanies(session?.authToken ?? "");
  const entity = useEntities(session?.authToken ?? "");
  return (
    <Container>
      <Stack>
        <Link to="/">Beranda</Link>
        <Title>Perusahaan</Title>
        {(users.list.error ??
          users.remove.error ??
          users.exporting.error ??
          entity.error) && (
          <Alert color="red">
            {
              (
                users.list.error ??
                users.remove.error ??
                users.exporting.error ??
                entity.error
              )?.message
            }
          </Alert>
        )}
        <Group>
          {(["companyName", "username", "email"] as const).map((name, i) => (
            <TextInput
              key={name}
              label={["Nama perusahaan", "Username", "Email"][i]}
              value={users.filters[name]}
              onChange={(e) => users.filter(name, e.currentTarget.value)}
            />
          ))}
          <Select
            label="Badan usaha"
            clearable
            data={(entity.data ?? []).map((v) => ({
              value: String(v.id),
              label: v.value ?? String(v.id),
            }))}
            value={users.filters.entityTypeId || null}
            onChange={(v) => users.filter("entityTypeId", v ?? "")}
          />
          <Select
            label="Status"
            clearable
            data={["active", "inactive", "blocked"]}
            value={users.filters.status || null}
            onChange={(v) => users.filter("status", v ?? "")}
          />
          <Select
            label="Urutkan"
            data={["createdAt", "companyName", "username", "email", "status"]}
            value={users.filters.sortBy}
            onChange={(v) => {
              if (v) users.filter("sortBy", v);
            }}
          />
          <Select
            label="Arah"
            data={["asc", "desc"]}
            value={users.filters.sortDirection}
            onChange={(v) => {
              if (v) users.filter("sortDirection", v);
            }}
          />
        </Group>
        <Group>
          {access.create && <Link to="/companies/add">Tambah perusahaan</Link>}
          <Button
            loading={users.exporting.isPending}
            onClick={() => users.exporting.mutate("pdf")}
          >
            Export PDF
          </Button>
          <Button
            loading={users.exporting.isPending}
            onClick={() => users.exporting.mutate("xlsx")}
          >
            Export XLSX
          </Button>
        </Group>
        {users.list.isFetching && <Text>Memuat...</Text>}
        <Table>
          <Table.Thead>
            <Table.Tr>
              {[
                "Badan usaha",
                "Nama",
                "Username",
                "Email",
                "Slug",
                "Status",
                "Aksi",
              ].map((v) => (
                <Table.Th key={v}>{v}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.list.data?.data.map((v) => (
              <Table.Tr key={v.id}>
                <Table.Td>{v.entityType}</Table.Td>
                <Table.Td>{v.companyName}</Table.Td>
                <Table.Td>{v.username}</Table.Td>
                <Table.Td>{v.email}</Table.Td>
                <Table.Td>{v.slug}</Table.Td>
                <Table.Td>{v.status}</Table.Td>
                <Table.Td>
                  <Group>
                    <Link to="/companies/$id" params={{ id: String(v.id) }}>
                      Lihat
                    </Link>
                    {access.update && (
                      <Link
                        to="/companies/$id/edit"
                        params={{ id: String(v.id) }}
                      >
                        Ubah
                      </Link>
                    )}
                    {access.delete && (
                      <Button
                        disabled={users.remove.isPending}
                        onClick={() => {
                          if (window.confirm("Hapus perusahaan ini?"))
                            users.remove.mutate(v.id);
                        }}
                      >
                        Hapus
                      </Button>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        <NumberInput
          label="Halaman"
          min={1}
          max={Math.max(1, Math.ceil((users.list.data?.count ?? 0) / 20))}
          value={users.page}
          onChange={(v) => users.setPage(Number(v) || 1)}
        />
        <Text>Total: {users.list.data?.count ?? 0}</Text>
      </Stack>
    </Container>
  );
}
