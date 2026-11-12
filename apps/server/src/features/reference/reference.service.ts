import type { ReferenceRepository } from "@server/features/reference/reference.type";
export const referenceService = (repository: ReferenceRepository) => ({
  programs: () => repository.listPrograms(),
  entityTypes: () => repository.listEntityTypes(),
  countries: () => repository.listCountries(),
  constants: (name?: string) => repository.listConstants(name),
  slugs: () => repository.listSlugs(),
});
