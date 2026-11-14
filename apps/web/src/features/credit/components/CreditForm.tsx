import { Alert, Button, NumberInput, Table, TextInput } from '@mantine/core';
import { DetailFields } from '@web/components/crud/DetailFields';
import { FormActions } from '@web/components/crud/FormActions';
import { FieldsGrid } from '@web/components/FieldsGrid';
import { FormSection } from '@web/components/FormSection';
import type { CreditRow } from '@web/features/credit/credit.type';
import { useCreditForm } from '@web/features/credit/hooks/useCreditForm';
import { Controller } from 'react-hook-form';
export function CreditForm({
  token,
  debitorId,
  row,
  self,
}: {
  token: string;
  debitorId: number;
  row?: CreditRow;
  self: boolean;
}) {
  const { form, save, simulation, rates } = useCreditForm(
    token,
    debitorId,
    row,
  );
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = form;
  return (
    <form noValidate onSubmit={handleSubmit((input) => save.mutate(input))}>
      <FormSection title="Data pengajuan">
        <Controller
          name="debitorId"
          control={control}
          render={({ field }) => (
            <NumberInput
              label="ID karyawan"
              min={1}
              disabled={self || !!row}
              value={field.value || ''}
              onChange={(v) => field.onChange(Number(v) || 0)}
              error={errors.debitorId?.message}
              required
            />
          )}
        />
        {rates.error && <Alert color="red.8">{rates.error.message}</Alert>}
        {rates.data && (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Tenor (bulan)</Table.Th>
                <Table.Th>Bunga per bulan (%)</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rates.data.map((rate) => (
                <Table.Tr key={rate.id}>
                  <Table.Td>{rate.jangkaWaktuBulan}</Table.Td>
                  <Table.Td>{rate.bungaPercentage}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
        <FieldsGrid>
          <TextInput
            label="Nominal pengajuan"
            {...register('jumlahPengajuan')}
            error={errors.jumlahPengajuan?.message}
            required
          />
          <Controller
            name="jangkaWaktuBulan"
            control={control}
            render={({ field }) => (
              <NumberInput
                label="Tenor (bulan)"
                min={1}
                value={field.value || ''}
                onChange={(v) => field.onChange(Number(v) || 0)}
                error={errors.jangkaWaktuBulan?.message}
                required
              />
            )}
          />
          <TextInput
            type="date"
            label="Tanggal pengajuan"
            {...register('tanggalPengajuan')}
            error={errors.tanggalPengajuan?.message}
            required
          />
        </FieldsGrid>
        <Button
          type="button"
          loading={simulation.isPending}
          onClick={handleSubmit((input) => simulation.mutate(input))}
        >
          Hitung simulasi
        </Button>
        {simulation.data && (
          <DetailFields
            title="Hasil simulasi"
            fields={[
              {
                label: 'Angsuran bulanan',
                value: `Rp ${simulation.data.installment.toLocaleString('id-ID')}`,
              },
              {
                label: 'Total',
                value: `Rp ${simulation.data.total.toLocaleString('id-ID')}`,
              },
              { label: 'Bunga', value: `${simulation.data.percentage}%` },
              {
                label: 'Pengajuan terbuka',
                value: `Rp ${simulation.data.open.toLocaleString('id-ID')}`,
              },
              {
                label: 'Score',
                value: `Rp ${simulation.data.score.toLocaleString('id-ID')}`,
              },
            ]}
          />
        )}
        {(save.error || simulation.error) && (
          <Alert color="red.8">
            {(save.error || simulation.error)?.message}
          </Alert>
        )}
        <FormActions
          pending={save.isPending}
          label="Simpan pengajuan"
          cancel={null}
        />
      </FormSection>
    </form>
  );
}
