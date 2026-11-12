import {
  CompanyConflict,
  CompanyNotFound,
} from "@server/features/companies/companies.error";
import { companiesRepository } from "@server/features/companies/companies.repository";
import type {
  CompanyInput,
  CompanyQuery,
} from "@server/features/companies/companies.type";
import { exportFile } from "@server/utils/export-file";
import { withTransaction } from "@server/utils/transaction";
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
    return withTransaction(async (tx) => {
      if (id && !(await companiesRepository.lock(id, tx)))
        throw new CompanyNotFound();
      if (await companiesRepository.conflict(input, id, tx))
        throw new CompanyConflict("Identitas perusahaan sudah digunakan");
      if (!(await companiesRepository.entity(input.entityTypeId, tx)))
        throw new CompanyConflict("Badan usaha tidak tersedia");
      const { oldInterests, oldExpenses } = await companiesRepository.children(
        id,
        tx,
      );
      if (
        input.bungaKredits.some(
          (v) => v.id !== undefined && !oldInterests.some((o) => o.id === v.id),
        ) ||
        input.biaya.some(
          (v) => v.id !== undefined && !oldExpenses.some((o) => o.id === v.id),
        )
      )
        throw new CompanyConflict("Konfigurasi bukan milik perusahaan");
      if (
        new Set(input.bungaKredits.filter((v) => v.id).map((v) => v.id))
          .size !== input.bungaKredits.filter((v) => v.id).length ||
        new Set(input.biaya.filter((v) => v.id).map((v) => v.id)).size !==
          input.biaya.filter((v) => v.id).length
      )
        throw new CompanyConflict("ID konfigurasi duplikat");
      const companyId = await companiesRepository.saveParent(
        { ...input, password },
        actor,
        id,
        tx,
      );
      if (!companyId) throw new Error("Gagal membuat perusahaan");
      await companiesRepository.saveChildren(
        input,
        actor,
        companyId,
        oldInterests
          .filter((o) => !input.bungaKredits.some((v) => v.id === o.id))
          .map((o) => o.id),
        oldExpenses
          .filter((o) => !input.biaya.some((v) => v.id === o.id))
          .map((o) => o.id),
        tx,
      );
      return companyId;
    });
  },
  remove: (id: number) =>
    withTransaction(async (tx) => {
      if (!(await companiesRepository.lock(id, tx))) return false;
      if (await companiesRepository.hasDebitors(id, tx))
        throw new CompanyConflict("Perusahaan masih memiliki debitor");
      return companiesRepository.remove(id, tx);
    }),
};
