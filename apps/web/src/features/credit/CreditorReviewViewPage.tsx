import {
  Alert,
  Button,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from '@mantine/core';
import { Link, useParams } from '@tanstack/react-router';
import { CrudPage } from '@web/components/crud/CrudPage';
import { DetailFields } from '@web/components/crud/DetailFields';
import { RecordState } from '@web/components/crud/RecordState';
import { useSession } from '@web/features/auth/hooks/useSession';
import type { CreditRow } from '@web/features/credit/credit.type';
import { useCreditReview } from '@web/features/credit/hooks/useCreditReview';
import { useCreditReviewForm } from '@web/features/credit/hooks/useCreditReviewForm';
import { crudaAccess } from '@web/utils/cruda';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
export function CreditorReviewViewPage() {
  return (
    <CrudPage program="DKN" action="read" title="Review Kredit">
      <Content />
    </CrudPage>
  );
}
function Content() {
  const { id } = useParams({ from: '/credit-reviews/$id' });
  const { session } = useSession();
  const token = session?.authToken ?? '';
  const query = useCreditReview(token, Number(id));
  const [notification, setNotification] = useState<string>();
  return (
    <RecordState id={Number(id)} query={query}>
      {(row) => (
        <>
          <DetailFields
            fields={[
              { label: 'Nama', value: row.nama },
              { label: 'NIK', value: row.noKtp },
              { label: 'Perusahaan', value: row.companyName },
              { label: 'Nominal', value: row.credit.jumlahPengajuan },
              { label: 'Tenor', value: row.credit.jangkaWaktuBulan },
              { label: 'Angsuran', value: row.credit.jumlahAngsuran },
              { label: 'Status HRD', value: row.credit.status },
              { label: 'Status BPR', value: row.credit.statusAdminApproval },
              { label: 'Pengajuan terbuka', value: row.summary?.open },
              { label: 'Score informatif', value: row.summary?.score },
            ]}
          />
          {row.expenses.map((expense) => (
            <DetailFields
              key={expense.id}
              fields={[
                {
                  label: expense.expenseName ?? 'Biaya',
                  value: expense.amount,
                },
              ]}
            />
          ))}
          {notification && (
            <Alert
              color={
                notification === 'failed' || notification === 'not-configured'
                  ? 'yellow'
                  : 'green'
              }
            >
              Keputusan tersimpan. Notifikasi: {notification}
            </Alert>
          )}
          {crudaAccess(session, 'DKN').approve &&
            row.credit.status === 'approved' &&
            row.credit.statusAdminApproval !== 'rejected' &&
            row.credit.statusAdminApproval !== 'completed' && (
              <Form
                token={token}
                row={row}
                onResult={setNotification}
                canUpdate={crudaAccess(session, 'DKN').update}
              />
            )}
          <Link to="/credit-reviews">Kembali</Link>
        </>
      )}
    </RecordState>
  );
}
function Form({
  token,
  row,
  onResult,
  canUpdate,
}: {
  token: string;
  row: CreditRow;
  onResult: (notification: string) => void;
  canUpdate: boolean;
}) {
  const { form, save } = useCreditReviewForm(token, row, onResult);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = form;
  const approved = row.credit.statusAdminApproval === 'approved';
  const locked = approved || !canUpdate;
  return (
    <form noValidate onSubmit={handleSubmit((value) => save.mutate(value))}>
      <Stack>
        <TextInput
          label="Nominal"
          {...register('jumlahPengajuan')}
          disabled={locked}
          error={errors.jumlahPengajuan?.message}
        />
        <Controller
          control={control}
          name="jangkaWaktuBulan"
          render={({ field }) => (
            <NumberInput
              label="Tenor"
              value={field.value}
              onChange={(value) => field.onChange(Number(value))}
              disabled={locked}
              error={errors.jangkaWaktuBulan?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="biayaAsuransiJiwa"
          render={({ field }) => (
            <NumberInput
              label="Asuransi jiwa"
              value={field.value}
              onChange={(value) => field.onChange(Number(value))}
              disabled={locked}
              error={errors.biayaAsuransiJiwa?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="statusAdminApproval"
          render={({ field }) => (
            <Select
              label="Keputusan BPR"
              allowDeselect={false}
              data={
                approved ? ['completed'] : ['approved', 'rejected', 'completed']
              }
              value={field.value}
              onChange={(value) => field.onChange(value)}
              error={errors.statusAdminApproval?.message}
            />
          )}
        />
        {save.error && <Alert color="red">{save.error.message}</Alert>}
        {save.data && (
          <Alert
            color={
              save.data.notification === 'failed' ||
              save.data.notification === 'not-configured'
                ? 'yellow'
                : 'green'
            }
          >
            Keputusan tersimpan. Notifikasi: {save.data.notification}
          </Alert>
        )}
        <Button type="submit" loading={save.isPending}>
          Simpan keputusan
        </Button>
      </Stack>
    </form>
  );
}
