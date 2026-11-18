import { AccountTypeEnum } from '@credit/contracts';
import {
  Alert,
  NumberInput,
  PasswordInput,
  Text,
  TextInput,
} from '@mantine/core';
import { FormActions } from '@web/components/crud/FormActions';
import { FieldsGrid } from '@web/components/FieldsGrid';
import { FormSection } from '@web/components/FormSection';
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
      <FormSection title="Akun karyawan">
        <FieldsGrid>
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
            description={
              props.id ? 'Kosongkan untuk mempertahankan password.' : undefined
            }
            {...register('password')}
            error={errors.password?.message}
            required={!props.id}
          />
        </FieldsGrid>
        {session?.type === AccountTypeEnum.Admin && !props.id && (
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
        {save.error && <Alert color="red.8">{save.error.message}</Alert>}
        {save.isSuccess && <Text>Akun tersimpan</Text>}
        <FormActions
          pending={save.isPending}
          label="Simpan akun"
          cancel={null}
        />
      </FormSection>
    </form>
  );
}
