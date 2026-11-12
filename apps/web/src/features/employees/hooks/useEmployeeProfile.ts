import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  downloadDocument,
  saveProfile,
  uploadDocuments,
} from '@web/features/employees/employees.api';
import {
  type EmployeeDetail,
  type EmployeeDocuments,
  type EmployeeProfile,
  employeeDocumentKinds,
  employeeDocumentsSchema,
  employeeProfileSchema,
  emptyDocuments,
  emptyProfile,
} from '@web/features/employees/employees.type';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
export function useEmployeeProfile(token: string, data: EmployeeDetail) {
  const client = useQueryClient();
  const form = useForm<EmployeeProfile>({
    resolver: zodResolver(employeeProfileSchema),
    mode: 'onTouched',
    defaultValues: { ...emptyProfile, ...data.profile },
  });
  const dirty = form.formState.isDirty;
  useEffect(() => {
    if (!dirty) {
      form.reset({ ...emptyProfile, ...data.profile });
    }
  }, [data.profile, dirty, form]);
  const save = useMutation({
    mutationFn: (input: EmployeeProfile) => saveProfile(token, data.id, input),
    onSuccess: async (_result, input) => {
      await client.invalidateQueries({ queryKey: ['employees'] });
      form.reset(input);
    },
  });
  return { form, save };
}
export function useEmployeeDocuments(token: string, data: EmployeeDetail) {
  const client = useQueryClient();
  const schema = employeeDocumentsSchema.superRefine((values, ctx) => {
    for (const kind of employeeDocumentKinds) {
      const file = values[kind];
      if (kind !== 'npwpUrl' && !file && !data.documents[kind]) {
        ctx.addIssue({
          code: 'custom',
          path: [kind],
          message: 'Dokumen wajib diisi',
        });
      }
      if (
        file &&
        (file.size === 0 ||
          file.size > 10 * 1024 * 1024 ||
          !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type))
      ) {
        ctx.addIssue({
          code: 'custom',
          path: [kind],
          message: 'Pilih JPG, PNG atau PDF maksimal 10 MB',
        });
      }
    }
  });
  const form = useForm<EmployeeDocuments>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: emptyDocuments,
  });
  const save = useMutation({
    mutationFn: (input: EmployeeDocuments) => {
      const body = new FormData();
      body.set('id', String(data.id));
      for (const kind of employeeDocumentKinds) {
        const file = input[kind];
        if (file) {
          body.set(kind, file);
        }
      }
      return uploadDocuments(token, body);
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['employees'] });
      form.reset(emptyDocuments);
    },
  });
  const download = useMutation({
    mutationFn: (kind: string) => downloadDocument(token, data.id, kind),
  });
  return { form, save, download };
}
