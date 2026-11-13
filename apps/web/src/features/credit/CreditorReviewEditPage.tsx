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
import { RecordState } from '@web/components/crud/RecordState';
import { useSession } from '@web/features/auth/hooks/useSession';
import type { CreditRow } from '@web/features/credit/credit.type';
import { useCreditReview } from '@web/features/credit/hooks/useCreditReview';
import { useCreditReviewForm } from '@web/features/credit/hooks/useCreditReviewForm';
import { crudaAccess } from '@web/utils/cruda';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
export function CreditorReviewEditPage() {
  return (
    <CrudPage program="DKN" action="approve" title="Keputusan BPR">
      <Content />
    </CrudPage>
  );
}
function Content() {
  const { id } = useParams({ from: '/credit-reviews/$id/edit' });
  const { session } = useSession();
  const token = session?.authToken ?? '';
  const query = useCreditReview(token, Number(id));
  const [notification, setNotification] = useState<string>();
  return (
    <RecordState id={Number(id)} query={query}>
      {(row) => (
        <>
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
          {row.credit.status === 'approved' &&
          row.credit.statusAdminApproval !== 'rejected' &&
          row.credit.statusAdminApproval !== 'completed' ? (
            <Form
              token={token}
              row={row}
              onResult={setNotification}
              canUpdate={crudaAccess(session, 'DKN').update}
            />
          ) : (
            <Alert>Pengajuan terkunci</Alert>
          )}
          <Link to="/credit-reviews/$id" params={{ id }}>
            Kembali
          </Link>
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
