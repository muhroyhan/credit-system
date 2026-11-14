import { Alert, Text, TextInput, Title } from '@mantine/core';
import { FormActions } from '@web/components/crud/FormActions';
import { FieldsGrid } from '@web/components/FieldsGrid';
import { FormSection } from '@web/components/FormSection';
import {
  employeeOptionalFields,
  employeeProfileFields,
} from '@web/features/employees/employees.constant';
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
      <FormSection title="Profil dan penghasilan">
        <Title order={3} size="h4">
          Identitas dan alamat
        </Title>
        <FieldsGrid>
          {employeeProfileFields.map(([name, label]) => (
            <TextInput
              key={name}
              label={label}
              type={name === 'tanggalLahir' ? 'date' : 'text'}
              required
              style={
                name === 'alamatKtp' || name === 'alamatDomisili'
                  ? { gridColumn: '1 / -1' }
                  : undefined
              }
              {...register(name)}
              error={errors[name]?.message}
            />
          ))}
        </FieldsGrid>
        <Title order={3} size="h4">
          Kontak dan penghasilan
        </Title>
        <FieldsGrid>
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
        </FieldsGrid>
        {save.error && <Alert color="red.8">{save.error.message}</Alert>}
        {save.isSuccess && <Text>Profil tersimpan</Text>}
        <FormActions
          pending={save.isPending}
          label="Simpan profil"
          cancel={null}
        />
      </FormSection>
    </form>
  );
}
