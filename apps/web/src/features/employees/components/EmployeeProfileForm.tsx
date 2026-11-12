import {
  employeeOptionalFields,
  employeeProfileFields,
} from '@credit/contracts';
import { Alert, Stack, Text, TextInput, Title } from '@mantine/core';
import { FormActions } from '@web/components/crud/FormActions';
import type { EmployeeDetail } from '@web/features/employees/employees.type';
import { useEmployeeProfile } from '@web/features/employees/hooks/useEmployeeProfile';
export function EmployeeProfileForm({
  token,
  data,
}: {
  token: string;
  data: EmployeeDetail;
}) {
  const { form, save } = useEmployeeProfile(token, data);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;
  return (
    <form noValidate onSubmit={handleSubmit((input) => save.mutate(input))}>
      <Stack>
        <Title order={2}>Profil dan penghasilan</Title>
        {employeeProfileFields.map(([name, label]) => (
          <TextInput
            key={name}
            label={label}
            type={name === 'tanggalLahir' ? 'date' : 'text'}
            required
            {...register(name)}
            error={errors[name]?.message}
          />
        ))}
        <TextInput
          label="Pendapatan bersih bulanan"
          inputMode="numeric"
          required
          {...register('takehomePay')}
          error={errors.takehomePay?.message}
        />
        {employeeOptionalFields.map(([name, label]) => (
          <TextInput
            key={name}
            label={label}
            {...register(name)}
            error={errors[name]?.message}
          />
        ))}
        {save.error && <Alert color="red">{save.error.message}</Alert>}
        {save.isSuccess && <Text>Profil tersimpan</Text>}
        <FormActions
          pending={save.isPending}
          label="Simpan profil"
          cancel={null}
        />
      </Stack>
    </form>
  );
}
