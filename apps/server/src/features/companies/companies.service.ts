import { companiesRepository } from "@server/features/companies/companies.repository";
import type {
  CompanyInput,
  CompanyQuery,
} from "@server/features/companies/companies.type";
export const companiesService = {
  list: (query: CompanyQuery) => companiesRepository.list(query),
  detail: (id: number) => companiesRepository.detail(id),
  async save(input: CompanyInput, actor: string, id?: number) {
    const password = input.password
      ? await Bun.password.hash(input.password, {
          algorithm: "bcrypt",
          cost: 10,
        })
      : undefined;
    return companiesRepository.save({ ...input, password }, actor, id);
  },
  remove: (id: number) => companiesRepository.remove(id),
};
