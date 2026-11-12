import {
  Alert,
  Button,
  Checkbox,
  Group,
  PasswordInput,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { Link } from "@tanstack/react-router";
import type { AdminInput } from "@web/features/admin-users/admin-users.api";
import { useAdminPrograms } from "@web/features/admin-users/hooks/useAdminDetail";
import { useAdminSave } from "@web/features/admin-users/hooks/useAdminSave";
import { useState } from "react";
export function AdminUserForm({
  token,
  id: editId,
  initial,
}: {
  token: string;
  id?: number;
  initial?: AdminInput;
}) {
  const [form, setForm] = useState<AdminInput>(
    initial ?? {
      username: "",
      email: "",
      password: "",
      isActive: true,
      roles: [],
    },
  );
  const programs = useAdminPrograms(token);
  const users = {
    options: (programs.data ?? []).map((p) => ({
      value: String(p.id),
      label: p.name ?? String(p.id),
    })),
  };
  const save = useAdminSave(token, editId);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate({ ...form, password: form.password || undefined });
      }}
    >
      <Stack>
        {(save.error ?? programs.error) && (
          <Alert color="red">{(save.error ?? programs.error)?.message}</Alert>
        )}
        {programs.isPending && <div>Memuat program...</div>}
        <TextInput
          label="Username administrator"
          required
          value={form.username}
          onChange={(e) =>
            setForm({ ...form, username: e.currentTarget.value })
          }
        />
        <TextInput
          label="Email administrator"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.currentTarget.value })}
        />
        <PasswordInput
          label="Password administrator"
          required={!editId}
          value={form.password ?? ""}
          onChange={(e) =>
            setForm({ ...form, password: e.currentTarget.value })
          }
        />
        <Checkbox
          label="Aktif"
          checked={form.isActive}
          onChange={(e) =>
            setForm({ ...form, isActive: e.currentTarget.checked })
          }
        />
        {users.options.map((p) => (
          <Select
            key={p.value}
            label={p.label}
            clearable
            data={[
              { value: "READ", label: "READ" },
              { value: "WRITE", label: "WRITE" },
            ]}
            value={
              form.roles.find((r) => r.programId === Number(p.value))?.value ??
              null
            }
            onChange={(v) =>
              setForm({
                ...form,
                roles: [
                  ...form.roles.filter((r) => r.programId !== Number(p.value)),
                  ...(v === "READ" || v === "WRITE"
                    ? [
                        {
                          programId: Number(p.value),
                          value: v as "READ" | "WRITE",
                        },
                      ]
                    : []),
                ],
              })
            }
          />
        ))}
        <Group>
          <Button
            type="submit"
            loading={save.isPending}
            disabled={!programs.isSuccess}
          >
            Simpan
          </Button>
          <Link to="/admin-users">Batal</Link>
        </Group>
      </Stack>
    </form>
  );
}
