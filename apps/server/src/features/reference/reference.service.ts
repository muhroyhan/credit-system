import { referenceRepository } from "@server/features/reference/reference.repository";
export const referenceService = {
  programs: () => referenceRepository.listPrograms(),
  entityTypes: () => referenceRepository.listEntityTypes(),
  countries: () => referenceRepository.listCountries(),
  constants: (name?: string) => referenceRepository.listConstants(name),
  slugs: () => referenceRepository.listSlugs(),
};
