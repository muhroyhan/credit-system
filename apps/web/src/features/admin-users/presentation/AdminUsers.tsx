import {
  Alert,
  Button,
  Checkbox,
  Group,
  NumberInput,
  PasswordInput,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useAdminUsers } from "@web/features/admin-users/application/useAdminUsers";
import type { AdminInput } from "@web/features/admin-users/data/gateway";
import { useState } from "react";
export function AdminUsers({
  token,
  canWrite,
}: {
  token: string;
  canWrite: boolean;
}) {
  const users = useAdminUsers(token);
  const [editId, setEditId] = useState<number | undefined>();
  const [editing, setEditing] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [form, setForm] = useState<AdminInput>({
    username: "",
    email: "",
    password: "",
    isActive: true,
    roles: [],
  });
  async function open(id: number, view: boolean) {
    try {
      const data = await users.detail(id);
      setEditId(id);
      setViewOnly(view);
      setForm({
        username: data.username ?? "",
        email: data.email ?? "",
        isActive: !!data.isActive,
        roles: data.roles ?? [],
      });
      setEditing(true);
    } catch {
      window.alert("Gagal memuat administrator");
    }
  }
  return (
    <Stack>
      <Title order={2}>Admin User</Title>
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
      </Group>
      {canWrite && (
        <Button
          onClick={() => {
            setEditId(undefined);
            setViewOnly(false);
            setForm({
              username: "",
              email: "",
              password: "",
              isActive: true,
              roles: [],
            });
            setEditing(true);
          }}
        >
          Tambah administrator
        </Button>
      )}
      {users.loading && <Text>Memuat...</Text>}
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Username</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Aksi</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {users.rows.map((u) => (
            <Table.Tr key={u.id}>
              <Table.Td>{u.username}</Table.Td>
              <Table.Td>{u.email}</Table.Td>
              <Table.Td>{u.isActive ? "Aktif" : "Tidak aktif"}</Table.Td>
              <Table.Td>
                <Group>
                  <Button onClick={() => void open(u.id, true)}>Lihat</Button>
                  {canWrite && (
                    <>
                      <Button onClick={() => void open(u.id, false)}>
                        Ubah
                      </Button>
                      <Button
                        color="red"
                        onClick={() => {
                          if (window.confirm("Hapus administrator ini?"))
                            void users.remove(u.id);
                        }}
                      >
                        Hapus
                      </Button>
                    </>
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
        max={Math.max(1, Math.ceil(users.total / 20))}
        value={users.page}
        onChange={(v) => users.setPage(Number(v) || 1)}
      />
      <Text>Total: {users.total}</Text>
      {editing && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void users
              .save({ ...form, password: form.password || undefined }, editId)
              .then((ok) => {
                if (ok) setEditing(false);
              });
          }}
        >
          <Stack>
            <Title order={3}>
              {viewOnly ? "Detail" : editId ? "Ubah" : "Tambah"} administrator
            </Title>
            <TextInput
              label="Username administrator"
              required
              disabled={viewOnly}
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.currentTarget.value })
              }
            />
            <TextInput
              label="Email administrator"
              type="email"
              required
              disabled={viewOnly}
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.currentTarget.value })
              }
            />
            {!viewOnly && (
              <PasswordInput
                label="Password administrator"
                required={!editId}
                value={form.password ?? ""}
                onChange={(e) =>
                  setForm({ ...form, password: e.currentTarget.value })
                }
              />
            )}
            <Checkbox
              label="Aktif"
              disabled={viewOnly}
              checked={form.isActive}
              onChange={(e) =>
                setForm({ ...form, isActive: e.currentTarget.checked })
              }
            />
            {users.options.map((p) => (
              <Select
                key={p.value}
                label={p.label}
                disabled={viewOnly}
                clearable
                data={[
                  { value: "READ", label: "READ" },
                  { value: "WRITE", label: "WRITE" },
                ]}
                value={
                  form.roles.find((r) => r.programId === Number(p.value))
                    ?.value ?? null
                }
                onChange={(v) =>
                  setForm({
                    ...form,
                    roles: [
                      ...form.roles.filter(
                        (r) => r.programId !== Number(p.value),
                      ),
                      ...(v === "READ" || v === "WRITE"
                        ? [{ programId: Number(p.value), value: v }]
                        : []),
                    ],
                  })
                }
              />
            ))}
            <Group>
              {!viewOnly && <Button type="submit">Simpan</Button>}
              <Button type="button" onClick={() => setEditing(false)}>
                Tutup
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Stack>
  );
}
