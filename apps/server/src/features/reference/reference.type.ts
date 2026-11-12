import type {
  constantSchema,
  countrySchema,
  programSchema,
  referenceItemSchema,
  slugSchema,
} from '@credit/contracts';
import type { SchemaOf } from '@server/constant/type';
import type { z } from 'zod';

export interface ReferenceRepository {
  listPrograms(): Promise<Array<z.infer<typeof programSchema>>>;
  listEntityTypes(): Promise<Array<z.infer<typeof referenceItemSchema>>>;
  listCountries(): Promise<Array<z.infer<typeof countrySchema>>>;
  listConstants(name?: string): Promise<Array<z.infer<typeof constantSchema>>>;
  listSlugs(): Promise<Array<z.infer<typeof slugSchema>>>;
}

export type ReferenceRoutes<S, P, E, C, K> = SchemaOf<S> &
  SchemaOf<P> &
  SchemaOf<E> &
  SchemaOf<C> &
  SchemaOf<K>;
