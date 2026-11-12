import {
  Alert,
  NumberInput,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { FormActions } from '@web/components/crud/FormActions';
import { useSession } from '@web/features/auth/hooks/useSession';
import type { EmployeePageProps } from '@web/features/employees/employees.type';
import { useEmployeeForm } from '@web/features/employees/hooks/useEmployeeForm';
import { Controller } from 'react-hook-form';
export function EmployeeForm(props: EmployeePageProps) {
  const { form, save, companies } = useEmployeeForm(props);
  const { session } = useSession();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form;
  return (
    <form noValidate onSubmit={handleSubmit((input) => save.mutate(input))}>
      <Stack>
        <TextInput
          label="Nama lengkap"
          {...register('namaLengkap')}
          error={errors.namaLengkap?.message}
          required
        />
        <TextInput
          label="Username karyawan"
          {...register('username')}
          error={errors.username?.message}
          required
        />
        <PasswordInput
          label="Password karyawan"
          {...register('password')}
          error={errors.password?.message}
          required={!props.id}
        />
        {session?.type === 'admin' && !props.id && (
          <>
            <Text>
              {companies.data
                ?.map((v) => `${v.id}: ${v.companyName}`)
                .join(', ')}
            </Text>
            <Controller
              name="userId"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="ID perusahaan"
                  min={1}
                  value={field.value ?? ''}
                  onChange={(value) =>
                    field.onChange(Number(value) || undefined)
                  }
                  error={errors.userId?.message}
                  required
                />
              )}
            />
          </>
        )}
        {save.error && <Alert color="red">{save.error.message}</Alert>}
        {save.isSuccess && <Text>Akun tersimpan</Text>}
        <FormActions
          pending={save.isPending}
          label="Simpan akun"
          cancel={null}
        />
      </Stack>
    </form>
  );
}
