import { companiesRepository } from "@server/features/companies/companies.repository";
import type {
  CompanyInput,
  CompanyQuery,
} from "@server/features/companies/companies.type";
import { exportFile } from "@server/utils/export-file";
export const companiesService = {
  async interests(slug: string) {
    const id = await companiesRepository.bySlug(slug);
    return id
      ? ((await companiesRepository.detail(id))?.bungaKredits ?? [])
      : [];
  },
  async exportFile(query: CompanyQuery, format: "pdf" | "xlsx") {
    const result = await companiesRepository.list(query, false);
    return exportFile({
      title: "Perusahaan",
      columns: [
        "Badan usaha",
        "Perusahaan",
        "Username",
        "Email",
        "Slug",
        "Status",
      ],
      values: result.data.map((v) => [
        v.entityType ?? "",
        v.companyName ?? "",
        v.username ?? "",
        v.email ?? "",
        v.slug ?? "",
        v.status ?? "",
      ]),
      format,
    });
  },
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
