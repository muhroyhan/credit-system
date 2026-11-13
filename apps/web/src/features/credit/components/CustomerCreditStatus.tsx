import { Alert, Button, Checkbox, Stack, Text, TextInput } from '@mantine/core';
import { RecordState } from '@web/components/crud/RecordState';
import { useCustomerCredit } from '@web/features/credit/hooks/useCustomerCredit';

export function CustomerCreditStatus({
  token,
  id,
}: {
  token: string;
  id: number;
}) {
  const { query, form, cancel, confirm } = useCustomerCredit(token, id);
  return (
    <RecordState id={id} query={query}>
      {(row) => (
        <Stack>
          <Text fw={600}>Rincian biaya</Text>
          {row.expenses.length === 0 ? (
            <Text>Tidak ada biaya</Text>
          ) : (
            row.expenses.map((item) => (
              <Text key={item.id}>
                {item.expenseName}: {item.amount}
              </Text>
            ))
          )}
          {row.credit.debitorAcknowledgmentTimestamp && (
            <Alert color="green">
              Konfirmasi tersimpan pada{' '}
              {row.credit.debitorAcknowledgmentTimestamp}.
            </Alert>
          )}
          {(cancel.error || confirm.error) && (
            <Alert color="red">
              {(cancel.error ?? confirm.error)?.message}
            </Alert>
          )}
          {row.credit.status === 'approved' &&
            row.credit.statusAdminApproval === 'approved' &&
            !row.credit.debitorAcknowledgmentTimestamp && (
              <>
                <Button
                  color="red"
                  disabled={cancel.isPending || confirm.isPending}
                  onClick={() => {
                    if (window.confirm('Batalkan pengajuan?')) {
                      cancel.mutate();
                    }
                  }}
                >
                  Batalkan pengajuan
                </Button>
                <form
                  onSubmit={form.handleSubmit((values) => {
                    if (values.confirmationName !== row.nama) {
                      form.setError('confirmationName', {
                        message: 'Nama harus sama dengan nama debitor',
                      });
                      return;
                    }
                    confirm.mutate(values);
                  })}
                >
                  <Stack>
                    <TextInput
                      label="Bank"
                      {...form.register('bankName')}
                      error={form.formState.errors.bankName?.message}
                    />
                    <TextInput
                      label="Cabang"
                      {...form.register('bankBranch')}
                      error={form.formState.errors.bankBranch?.message}
                    />
                    <TextInput
                      label="Nama rekening"
                      {...form.register('bankAccountName')}
                      error={form.formState.errors.bankAccountName?.message}
                    />
                    <TextInput
                      label="Nomor rekening"
                      {...form.register('bankAccountNumber')}
                      error={form.formState.errors.bankAccountNumber?.message}
                    />
                    <TextInput
                      label="Konfirmasi nama lengkap"
                      {...form.register('confirmationName')}
                      error={form.formState.errors.confirmationName?.message}
                    />
                    <Checkbox
                      label="Saya menyatakan data benar"
                      {...form.register('confirmed')}
                      error={form.formState.errors.confirmed?.message}
                    />
                    <Button
                      type="submit"
                      disabled={confirm.isPending || cancel.isPending}
                    >
                      Simpan konfirmasi
                    </Button>
                  </Stack>
                </form>
              </>
            )}
        </Stack>
      )}
    </RecordState>
  );
}
