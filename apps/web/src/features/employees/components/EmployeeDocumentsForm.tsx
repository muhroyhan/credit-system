import { employeeDocumentKinds } from '@credit/contracts';
import { Alert, Button, FileInput, Stack, Text } from '@mantine/core';
import { FormActions } from '@web/components/crud/FormActions';
import { FieldsGrid } from '@web/components/FieldsGrid';
import { FormSection } from '@web/components/FormSection';
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
      <FormSection title="Dokumen">
        <Text size="sm" c="dimmed">
          JPG, PNG atau PDF; maksimal 10 MB per file. Pilih file untuk mengganti
          dokumen tersimpan, lalu simpan bagian ini.
        </Text>
        <FieldsGrid>
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
        </FieldsGrid>
        {(save.error ?? download.error) && (
          <Alert color="red">{(save.error ?? download.error)?.message}</Alert>
        )}
        {save.isSuccess && <Text>Dokumen tersimpan</Text>}
        <FormActions
          pending={save.isPending}
          label="Simpan dokumen"
          cancel={null}
        />
      </FormSection>
    </form>
  );
}
