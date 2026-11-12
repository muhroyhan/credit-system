import type {
  constantSchema,
  countrySchema,
  programSchema,
  referenceItemSchema,
  slugSchema,
} from "@credit/contracts";
import type { z } from "zod";
export interface ReferenceRepository {
  listPrograms(): Promise<z.infer<typeof programSchema>[]>;
  listEntityTypes(): Promise<z.infer<typeof referenceItemSchema>[]>;
  listCountries(): Promise<z.infer<typeof countrySchema>[]>;
  listConstants(name?: string): Promise<z.infer<typeof constantSchema>[]>;
  listSlugs(): Promise<z.infer<typeof slugSchema>[]>;
}

import type { SchemaOf } from "@server/constant/type";
export type ReferenceRoutes<S, P, E, C, K> = SchemaOf<S> &
  SchemaOf<P> &
  SchemaOf<E> &
  SchemaOf<C> &
  SchemaOf<K>;
