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
import type { AdminUserFormProps } from "@web/features/admin-users/admin-users.type";
import { useAdminPrograms } from "@web/features/admin-users/hooks/useAdminDetail";
import { useAdminForm } from "@web/features/admin-users/hooks/useAdminForm";
import { useAdminSave } from "@web/features/admin-users/hooks/useAdminSave";
import { Controller } from "react-hook-form";
export function AdminUserForm({
  token,
  id: editId,
  initial,
}: AdminUserFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useAdminForm(initial, !!editId);
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
      noValidate
      onSubmit={handleSubmit((data) =>
        save.mutate({ ...data, password: data.password || undefined }),
      )}
    >
      <Stack>
        {(save.error ?? programs.error) && (
          <Alert color="red">{(save.error ?? programs.error)?.message}</Alert>
        )}
        {programs.isPending && <div>Memuat program...</div>}
        <TextInput
          label="Username administrator"
          required
          {...register("username")}
          error={errors.username?.message}
        />
        <TextInput
          label="Email administrator"
          type="email"
          required
          {...register("email")}
          error={errors.email?.message}
        />
        <PasswordInput
          label="Password administrator"
          required={!editId}
          {...register("password")}
          error={errors.password?.message}
        />
        <Checkbox
          label="Aktif"
          {...register("isActive")}
          error={errors.isActive?.message}
        />
        <Controller
          name="roles"
          control={control}
          render={({ field }) => (
            <>
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
                    field.value.find((r) => r.programId === Number(p.value))
                      ?.value ?? null
                  }
                  onBlur={field.onBlur}
                  error={errors.roles?.message}
                  onChange={(v) =>
                    field.onChange([
                      ...field.value.filter(
                        (r) => r.programId !== Number(p.value),
                      ),
                      ...(v === "READ" || v === "WRITE"
                        ? [{ programId: Number(p.value), value: v }]
                        : []),
                    ])
                  }
                />
              ))}
              {errors.roles?.message && users.options.length === 0 && (
                <Alert color="red">{errors.roles.message}</Alert>
              )}
            </>
          )}
        />
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
