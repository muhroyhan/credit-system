import { adminRoleSchema } from '@credit/contracts';
import {
  Alert,
  Checkbox,
  MultiSelect,
  PasswordInput,
  TextInput,
} from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { FormActions } from '@web/components/crud/FormActions';
import { FieldsGrid } from '@web/components/FieldsGrid';
import { FormSection } from '@web/components/FormSection';
import { PERMISSION_OPTIONS } from '@web/constant/constant';
import type { AdminUserFormProps } from '@web/features/admin-users/admin-users.type';
import { useAdminForm } from '@web/features/admin-users/hooks/useAdminForm';
import { useAdminPrograms } from '@web/features/admin-users/hooks/useAdminPrograms';
import { useAdminSave } from '@web/features/admin-users/hooks/useAdminSave';
import { Controller } from 'react-hook-form';

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
      <FormSection title="Akun administrator">
        {(save.error ?? programs.error) && (
          <Alert color="red">{(save.error ?? programs.error)?.message}</Alert>
        )}
        {programs.isPending && <div>Memuat program...</div>}
        <FieldsGrid>
          <TextInput
            label="Username administrator"
            required
            {...register('username')}
            error={errors.username?.message}
          />
          <TextInput
            label="Email administrator"
            type="email"
            required
            {...register('email')}
            error={errors.email?.message}
          />
          <PasswordInput
            label="Password administrator"
            description={
              editId ? 'Kosongkan untuk mempertahankan password.' : undefined
            }
            required={!editId}
            {...register('password')}
            error={errors.password?.message}
          />
          <Checkbox
            label="Aktif"
            {...register('isActive')}
            error={errors.isActive?.message}
          />
        </FieldsGrid>
        <Controller
          name="roles"
          control={control}
          render={({ field }) => (
            <FieldsGrid>
              {users.options.map((p) => (
                <MultiSelect
                  key={p.value}
                  label={p.label}
                  data={PERMISSION_OPTIONS}
                  value={field.value
                    .filter((r) => r.programId === Number(p.value))
                    .map((r) => r.value)}
                  onBlur={field.onBlur}
                  error={errors.roles?.message}
                  onChange={(values) =>
                    field.onChange([
                      ...field.value.filter(
                        (r) => r.programId !== Number(p.value),
                      ),
                      ...values.flatMap((value) => {
                        const parsed = adminRoleSchema.safeParse({
                          programId: Number(p.value),
                          value,
                        });
                        return parsed.success ? [parsed.data] : [];
                      }),
                    ])
                  }
                />
              ))}
              {errors.roles?.message && users.options.length === 0 && (
                <Alert color="red">{errors.roles.message}</Alert>
              )}
            </FieldsGrid>
          )}
        />
        <FormActions
          pending={save.isPending}
          disabled={!programs.isSuccess}
          cancel={<Link to="/admin-users">Batal</Link>}
        />
      </FormSection>
    </form>
  );
}
