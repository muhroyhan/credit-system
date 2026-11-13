import { employeeAccountSchema } from '@credit/contracts';
import { z } from 'zod';

export const registrationSchema = employeeAccountSchema
  .extend({ confirmPassword: z.string() })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Konfirmasi password tidak sama',
  });
export type RegistrationInput = z.infer<typeof registrationSchema>;
