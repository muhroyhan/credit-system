import type { companyInputSchema, companyQuerySchema } from '@credit/contracts';
import type { SchemaOf } from '@server/constant/type';
import type { z } from 'zod';

export type CompanyInput = z.infer<typeof companyInputSchema>;
export type CompanyQuery = z.infer<typeof companyQuerySchema>;

export type CompaniesRoutes<L, D, C, U, R, I, E> = SchemaOf<L> &
  SchemaOf<D> &
  SchemaOf<C> &
  SchemaOf<U> &
  SchemaOf<R> &
  SchemaOf<I> &
  SchemaOf<E>;
