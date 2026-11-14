import { CompanyStatusEnum } from '@credit/contracts';
import {
  Alert,
  Button,
  NumberInput,
  PasswordInput,
  Select,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { FormActions } from '@web/components/crud/FormActions';
import { FieldsGrid } from '@web/components/FieldsGrid';
import { FormSection } from '@web/components/FormSection';
import { statusPresentation } from '@web/constant/constant';
import type { CompanyFormProps } from '@web/features/companies/companies.type';
import { useCompanyForm } from '@web/features/companies/hooks/useCompanyForm';
import { useEntities } from '@web/features/companies/hooks/useEntities';
import { Controller, useFieldArray } from 'react-hook-form';

export function CompanyForm({ token, id, initial }: CompanyFormProps) {
  const { form, save } = useCompanyForm(token, id, initial);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form;
  const entity = useEntities(token);
  const interests = useFieldArray({
    control,
    name: 'bungaKredits',
    keyName: 'key',
  });
  const expenses = useFieldArray({ control, name: 'biaya', keyName: 'key' });
  return (
    <form noValidate onSubmit={handleSubmit((data) => save.mutate(data))}>
      <FormSection title="Data perusahaan">
        {(save.error ?? entity.error) && (
          <Alert color="red">{(save.error ?? entity.error)?.message}</Alert>
        )}
        <FieldsGrid>
          <Controller
            name="entityTypeId"
            control={control}
            render={({ field }) => (
              <Select
                label="Badan usaha"
                data={(entity.data ?? []).map((v) => ({
                  value: String(v.id),
                  label: v.value ?? String(v.id),
                }))}
                value={field.value ? String(field.value) : null}
                onChange={(v) => field.onChange(Number(v))}
                onBlur={field.onBlur}
                error={errors.entityTypeId?.message}
              />
            )}
          />
          <TextInput
            label="Nama perusahaan"
            {...register('companyName')}
            error={errors.companyName?.message}
          />
          <TextInput
            label="Username perusahaan"
            {...register('username')}
            error={errors.username?.message}
          />
          <TextInput
            label="Email perusahaan"
            {...register('email')}
            error={errors.email?.message}
          />
          <TextInput
            label="Slug"
            {...register('slug')}
            error={errors.slug?.message}
          />
          <PasswordInput
            label="Password perusahaan"
            description={
              id ? 'Kosongkan untuk mempertahankan password.' : undefined
            }
            {...register('password')}
            error={errors.password?.message}
          />
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                label="Status perusahaan"
                {...field}
                data={Object.values(CompanyStatusEnum).map((value) => ({
                  value,
                  label: statusPresentation[value]?.label ?? value,
                }))}
                onChange={(v) => {
                  if (v) {
                    field.onChange(v);
                  }
                }}
                error={errors.status?.message}
              />
            )}
          />
        </FieldsGrid>
        <Title order={2}>Bunga per tenor</Title>
        {interests.fields.map((row, index) => (
          <Stack key={row.key} gap="sm">
            <FieldsGrid>
              <TextInput
                label={`Bunga ${index + 1} (%)`}
                {...register(`bungaKredits.${index}.bungaPercentage`)}
                error={errors.bungaKredits?.[index]?.bungaPercentage?.message}
              />
              <TextInput
                label={`Tenor ${index + 1} (bulan)`}
                {...register(`bungaKredits.${index}.jangkaWaktuBulan`)}
                error={errors.bungaKredits?.[index]?.jangkaWaktuBulan?.message}
              />
            </FieldsGrid>
            <Button
              variant="subtle"
              color="red"
              style={{ alignSelf: 'flex-start' }}
              type="button"
              onClick={() => interests.remove(index)}
            >
              Hapus bunga {index + 1}
            </Button>
          </Stack>
        ))}
        <Button
          variant="light"
          style={{ alignSelf: 'flex-start' }}
          type="button"
          onClick={() =>
            interests.append({ bungaPercentage: '', jangkaWaktuBulan: '' })
          }
        >
          Tambah bunga
        </Button>
        <Title order={2}>Biaya</Title>
        {expenses.fields.map((row, index) => (
          <Stack key={row.key} gap="sm">
            <FieldsGrid three>
              <TextInput
                label={`Nama biaya ${index + 1}`}
                {...register(`biaya.${index}.expenseType`)}
                error={errors.biaya?.[index]?.expenseType?.message}
              />
              <TextInput
                label={`Jenis biaya ${index + 1}`}
                description="%: nominal pengajuan, x: angsuran, lainnya: nilai tetap"
                {...register(`biaya.${index}.type`)}
                error={errors.biaya?.[index]?.type?.message}
              />
              <Controller
                name={`biaya.${index}.value`}
                control={control}
                render={({ field }) => (
                  <NumberInput
                    label={`Nilai biaya ${index + 1}`}
                    value={field.value}
                    onChange={(v) =>
                      field.onChange(v === '' ? undefined : Number(v))
                    }
                    onBlur={field.onBlur}
                    error={errors.biaya?.[index]?.value?.message}
                  />
                )}
              />
            </FieldsGrid>
            <Button
              variant="subtle"
              color="red"
              style={{ alignSelf: 'flex-start' }}
              type="button"
              onClick={() => expenses.remove(index)}
            >
              Hapus biaya {index + 1}
            </Button>
          </Stack>
        ))}
        <Button
          variant="light"
          style={{ alignSelf: 'flex-start' }}
          type="button"
          onClick={() =>
            expenses.append({ expenseType: '', type: '', value: 0 })
          }
        >
          Tambah biaya
        </Button>
        <FormActions
          pending={save.isPending}
          disabled={!entity.isSuccess}
          cancel={<Link to="/companies">Batal</Link>}
        />
      </FormSection>
    </form>
  );
}
