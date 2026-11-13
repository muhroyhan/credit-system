import { employeeDocumentKinds } from '@credit/contracts';
import { Alert, Button, FileInput, Stack, Text, Title } from '@mantine/core';
import { FormActions } from '@web/components/crud/FormActions';
import { employeeDocumentLabels } from '@web/features/employees/employees.constant';
import type { EmployeeDetail } from '@web/features/employees/employees.type';
import { useEmployeeDocuments } from '@web/features/employees/hooks/useEmployeeDocuments';
import { Controller } from 'react-hook-form';
export function EmployeeDocumentsForm({
  token,
  data,
}: {
  token: string;
  data: EmployeeDetail;
}) {
  const { form, save, download } = useEmployeeDocuments(token, data);
  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((input) => save.mutate(input))}
    >
      <Stack>
        <Title order={2}>Dokumen</Title>
        {employeeDocumentKinds.map((kind) => (
          <Stack key={kind} gap="xs">
            <Controller
              control={form.control}
              name={kind}
              render={({ field }) => (
                <FileInput
                  label={employeeDocumentLabels[kind]}
                  accept="image/jpeg,image/png,application/pdf"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={form.formState.errors[kind]?.message}
                  required={kind !== 'npwpUrl' && !data.documents[kind]}
                  clearable
                />
              )}
            />
            {data.documents[kind] && (
              <Button
                variant="subtle"
                type="button"
                onClick={() => download.mutate(kind)}
              >
                Unduh {employeeDocumentLabels[kind]}
              </Button>
            )}
          </Stack>
        ))}
        {(save.error ?? download.error) && (
          <Alert color="red">{(save.error ?? download.error)?.message}</Alert>
        )}
        {save.isSuccess && <Text>Dokumen tersimpan</Text>}
        <FormActions
          pending={save.isPending}
          label="Simpan dokumen"
          cancel={null}
        />
      </Stack>
    </form>
  );
}
