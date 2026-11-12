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
import { useAdminUsers } from "@web/features/admin-users/hooks/useAdminUsers";
import { useSession } from "@web/features/auth/hooks/useSession";
import { crudaAccess } from "@web/utils/cruda";
export function AdminUsersPage() {
  return (
    <AccessGate program="USA" action="read">
      <Listing />
    </AccessGate>
  );
}
function Listing() {
  const { session } = useSession();
  const access = crudaAccess(session, "USA");
  const users = useAdminUsers(session?.authToken ?? "");
  return (
    <Container>
      <Stack>
        <Link to="/">Beranda</Link>
        <Title>Admin User</Title>
        {users.error && <Alert color="red">{users.error}</Alert>}
        <Group>
          <TextInput
            label="Username"
            value={users.username}
            onChange={(e) => {
              users.setUsername(e.currentTarget.value);
              users.setPage(1);
            }}
          />
          <TextInput
            label="Email"
            value={users.email}
            onChange={(e) => {
              users.setEmail(e.currentTarget.value);
              users.setPage(1);
            }}
          />
          <Select
            label="Status"
            clearable
            value={users.active}
            onChange={(v) => {
              users.setActive(v);
              users.setPage(1);
            }}
            data={[
              { value: "true", label: "Aktif" },
              { value: "false", label: "Tidak aktif" },
            ]}
          />
          <Select
            label="Urutkan"
            value={users.sortBy}
            allowDeselect={false}
            onChange={(v) => {
              if (v) users.setSortBy(v);
              users.setPage(1);
            }}
            data={[
              { value: "createdAt", label: "Tanggal dibuat" },
              { value: "username", label: "Username" },
              { value: "email", label: "Email" },
              { value: "isActive", label: "Status" },
            ]}
          />
          <Select
            label="Arah urutan"
            value={users.sortDirection}
            allowDeselect={false}
            onChange={(v) => {
              if (v) users.setSortDirection(v);
              users.setPage(1);
            }}
            data={[
              { value: "asc", label: "Naik" },
              { value: "desc", label: "Turun" },
            ]}
          />
        </Group>
        <Group>
          {access.create && (
            <Link to="/admin-users/add">Tambah administrator</Link>
          )}
          <Button
            loading={users.exporting}
            disabled={users.loading}
            onClick={() => users.exportRows("pdf")}
          >
            Export PDF
          </Button>
          <Button
            loading={users.exporting}
            disabled={users.loading}
            onClick={() => users.exportRows("xlsx")}
          >
            Export XLSX
          </Button>
        </Group>
        {users.loading && <Text>Memuat...</Text>}
        <Table>
          <Table.Thead>
            <Table.Tr>
              {["Username", "Email", "Status", "Aksi"].map((label) => (
                <Table.Th key={label}>{label}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.rows.map((row) => (
              <Table.Tr key={row.id}>
                <Table.Td>{row.username}</Table.Td>
                <Table.Td>{row.email}</Table.Td>
                <Table.Td>{row.isActive ? "Aktif" : "Tidak aktif"}</Table.Td>
                <Table.Td>
                  <Group>
                    <Link to="/admin-users/$id" params={{ id: String(row.id) }}>
                      Lihat
                    </Link>
                    {access.update && (
                      <Link
                        to="/admin-users/$id/edit"
                        params={{ id: String(row.id) }}
                      >
                        Ubah
                      </Link>
                    )}
                    {access.delete && (
                      <Button
                        color="red"
                        disabled={users.deleting}
                        onClick={() => {
                          if (window.confirm("Hapus administrator ini?"))
                            users.remove(row.id);
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
        {!users.loading && !users.rows.length && (
          <Text>Tidak ada administrator</Text>
        )}
        <NumberInput
          label="Halaman"
          min={1}
          max={Math.max(1, Math.ceil(users.total / 20))}
          value={users.page}
          onChange={(v) => users.setPage(Number(v) || 1)}
        />
        <Text>Total: {users.total}</Text>
      </Stack>
    </Container>
  );
}
