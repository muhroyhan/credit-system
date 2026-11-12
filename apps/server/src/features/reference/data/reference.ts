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
    const { db, pool } = connectDatabase();
    try {
      return await db
        .select({
          id: programs.id,
          name: programs.name,
          abbreviation: programs.abbreviation,
        })
        .from(programs);
    } finally {
      await pool.end();
    }
  },
  async listEntityTypes() {
    const { db, pool } = connectDatabase();
    try {
      return await db
        .select({ id: entityTypes.id, value: entityTypes.value })
        .from(entityTypes);
    } finally {
      await pool.end();
    }
  },
  async listCountries() {
    const { db, pool } = connectDatabase();
    try {
      return await db
        .select({
          id: countries.id,
          code: countries.code,
          value: countries.value,
        })
        .from(countries);
    } finally {
      await pool.end();
    }
  },
  async listConstants(name) {
    const { db, pool } = connectDatabase();
    try {
      const query = db
        .select({
          id: constants.id,
          name: constants.name,
          type: constants.type,
          value: constants.value,
        })
        .from(constants);
      return name === undefined
        ? await query
        : await query.where(eq(constants.name, name));
    } finally {
      await pool.end();
    }
  },
  async listSlugs() {
    const { db, pool } = connectDatabase();
    try {
      return await db
        .select({
          id: users.id,
          companyName: users.companyName,
          slug: users.slug,
        })
        .from(users);
    } finally {
      await pool.end();
    }
  },
};
