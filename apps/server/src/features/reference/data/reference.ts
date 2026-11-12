import { connectDatabase } from "@credit/database/client";
import {
  constants,
  countries,
  entityTypes,
  programs,
  users,
} from "@credit/database/schema";
import type { ReferenceRepository } from "@server/features/reference/application/reference";
import { eq } from "drizzle-orm";

export const referenceRepository: ReferenceRepository = {
  async listPrograms() {
    return connectDatabase()
      .db.select({
        id: programs.id,
        name: programs.name,
        abbreviation: programs.abbreviation,
      })
      .from(programs);
  },
  async listEntityTypes() {
    return connectDatabase()
      .db.select({ id: entityTypes.id, value: entityTypes.value })
      .from(entityTypes);
  },
  async listCountries() {
    return connectDatabase()
      .db.select({
        id: countries.id,
        code: countries.code,
        value: countries.value,
      })
      .from(countries);
  },
  async listConstants(name) {
    const query = connectDatabase()
      .db.select({
        id: constants.id,
        name: constants.name,
        type: constants.type,
        value: constants.value,
      })
      .from(constants);
    return name === undefined
      ? await query
      : await query.where(eq(constants.name, name));
  },
  async listSlugs() {
    return connectDatabase()
      .db.select({
        id: users.id,
        companyName: users.companyName,
        slug: users.slug,
      })
      .from(users);
  },
};
