import {
  Alert,
  Button,
  NumberInput,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { FormActions } from '@web/components/crud/FormActions';
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
      <Stack>
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
        {rates.error && <Alert color="red">{rates.error.message}</Alert>}
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
        <Button
          type="button"
          loading={simulation.isPending}
          onClick={handleSubmit((input) => simulation.mutate(input))}
        >
          Hitung simulasi
        </Button>
        {simulation.data && (
          <Text>
            Angsuran bulanan: Rp
            {simulation.data.installment.toLocaleString('id-ID')} | Total: Rp
            {simulation.data.total.toLocaleString('id-ID')} | Bunga:{' '}
            {simulation.data.percentage}% | Pengajuan terbuka: Rp
            {simulation.data.open.toLocaleString('id-ID')} | Score: Rp
            {simulation.data.score.toLocaleString('id-ID')}
          </Text>
        )}
        {(save.error || simulation.error) && (
          <Alert color="red">{(save.error || simulation.error)?.message}</Alert>
        )}
        <FormActions
          pending={save.isPending}
          label="Simpan pengajuan"
          cancel={null}
        />
      </Stack>
    </form>
  );
}
