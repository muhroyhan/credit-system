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
export const createReferenceService = (repository: ReferenceRepository) => ({
  programs: () => repository.listPrograms(),
  entityTypes: () => repository.listEntityTypes(),
  countries: () => repository.listCountries(),
  constants: (name?: string) => repository.listConstants(name),
  slugs: () => repository.listSlugs(),
});
