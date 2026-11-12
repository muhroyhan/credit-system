export interface ReferenceRepository {
  listPrograms(): Promise<unknown>;
  listEntityTypes(): Promise<unknown>;
  listCountries(): Promise<unknown>;
  listConstants(name?: string): Promise<unknown>;
  listSlugs(): Promise<unknown>;
}
export const createReferenceService = (repository: ReferenceRepository) => ({
  programs: () => repository.listPrograms(),
  entityTypes: () => repository.listEntityTypes(),
  countries: () => repository.listCountries(),
  constants: (name?: string) => repository.listConstants(name),
  slugs: () => repository.listSlugs(),
});
