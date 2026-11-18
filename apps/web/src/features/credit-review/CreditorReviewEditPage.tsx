import { CreditStatusEnum } from '@credit/contracts';
import { Alert, Button, NumberInput, Select, TextInput } from '@mantine/core';
import { Link, useParams } from '@tanstack/react-router';
import { CrudPage } from '@web/components/crud/CrudPage';
import { DetailFields } from '@web/components/crud/DetailFields';
import { RecordState } from '@web/components/crud/RecordState';
import { FieldsGrid } from '@web/components/FieldsGrid';
import { FormSection } from '@web/components/FormSection';
import { StatusBadge } from '@web/components/StatusBadge';
import { statusPresentation } from '@web/constant/constant';
import { useSession } from '@web/features/auth/hooks/useSession';
import type { CreditReviewDetail } from '@web/features/credit-review/credit-review.type';
import { useCreditReview } from '@web/features/credit-review/hooks/useCreditReview';
import { useCreditReviewForm } from '@web/features/credit-review/hooks/useCreditReviewForm';
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
          <DetailFields
            fields={[
              { label: 'Nama', value: row.nama },
              { label: 'Perusahaan', value: row.companyName },
              {
                label: 'Status HRD',
                value: <StatusBadge value={row.credit.status} />,
              },
              {
                label: 'Status BPR',
                value: <StatusBadge value={row.credit.statusAdminApproval} />,
              },
            ]}
          />
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
          {row.credit.status === CreditStatusEnum.Approved &&
          row.credit.statusAdminApproval !== CreditStatusEnum.Rejected &&
          row.credit.statusAdminApproval !== CreditStatusEnum.Completed ? (
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
  row: CreditReviewDetail;
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
  const approved = row.credit.statusAdminApproval === CreditStatusEnum.Approved;
  const locked = approved || !canUpdate;
  return (
    <form noValidate onSubmit={handleSubmit((value) => save.mutate(value))}>
      <FormSection title="Rincian keputusan">
        <FieldsGrid>
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
                data={(approved
                  ? [CreditStatusEnum.Completed]
                  : [
                      CreditStatusEnum.Approved,
                      CreditStatusEnum.Rejected,
                      CreditStatusEnum.Completed,
                    ]
                ).map((value) => ({
                  value,
                  label: statusPresentation[value]?.label ?? value,
                }))}
                value={field.value}
                onChange={(value) => field.onChange(value)}
                error={errors.statusAdminApproval?.message}
              />
            )}
          />
        </FieldsGrid>
        {save.error && <Alert color="red.8">{save.error.message}</Alert>}
        <Button type="submit" loading={save.isPending}>
          Simpan keputusan
        </Button>
      </FormSection>
    </form>
  );
}
