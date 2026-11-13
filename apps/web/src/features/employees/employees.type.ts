import {
  employeeAccountSchema,
  employeeCreateSchema,
  employeeDetailSchema,
  employeeDocumentKindSchema,
  employeeListSchema,
  employeeProfileSchema,
} from '@credit/contracts';
import { z } from 'zod';

export { employeeDetailSchema, employeeListSchema, employeeProfileSchema };
export const employeeFormSchema = employeeCreateSchema
  .omit({ password: true })
  .extend({ password: z.string() });
export function accountFormSchema(edit: boolean, admin = false) {
  return employeeFormSchema.superRefine((value, ctx) => {
    if (!edit && admin && !value.userId) {
      ctx.addIssue({
        code: 'custom',
        path: ['userId'],
        message: 'Perusahaan wajib dipilih',
      });
    }
    if (!edit || value.password) {
      const parsed = employeeAccountSchema.shape.password.safeParse(
        value.password,
      );
      if (!parsed.success) {
        ctx.addIssue({
          code: 'custom',
          path: ['password'],
          message: 'Minimal 8 karakter, huruf besar/kecil dan angka',
        });
      }
    }
  });
}
export type EmployeeFormInput = z.infer<typeof employeeFormSchema>;
export type EmployeeDetail = z.infer<typeof employeeDetailSchema>;
export interface EmployeePageProps {
  token: string;
  id?: number;
  initial?: EmployeeDetail;
}

export const employeeDocumentsSchema = z.record(
  employeeDocumentKindSchema,
  z.instanceof(File).nullable(),
);
export type EmployeeDocuments = z.infer<typeof employeeDocumentsSchema>;
