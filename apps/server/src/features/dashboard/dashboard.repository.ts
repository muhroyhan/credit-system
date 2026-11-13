import {
  AccountTypeEnum,
  CompanyStatusEnum,
  CreditStatusEnum,
} from '@credit/contracts';
import { connectDatabase } from '@credit/database/client';
import { credits, debitors, users } from '@credit/database/schema';
import type { DashboardScope } from '@server/features/dashboard/dashboard.type';
import { and, count, eq, inArray, sql } from 'drizzle-orm';

export const dashboardRepository = {
  async totals(scope: DashboardScope) {
    const db = connectDatabase().db;
    const [companies] = await db
      .select({ value: count() })
      .from(users)
      .where(
        inArray(users.status, [
          CompanyStatusEnum.Active,
          CompanyStatusEnum.Inactive,
        ]),
      );
    const tenantScope =
      scope.type === AccountTypeEnum.Admin
        ? undefined
        : eq(users.slug, scope.slug);
    const [people] =
      scope.type === AccountTypeEnum.Debitor
        ? [{ value: 0 }]
        : await db
            .select({ value: count() })
            .from(debitors)
            .innerJoin(users, eq(users.id, debitors.userId))
            .where(tenantScope);
    const conditions = and(
      tenantScope,
      scope.type === AccountTypeEnum.Debitor
        ? eq(debitors.id, scope.id)
        : undefined,
    );
    const rows = await db
      .select({
        status: credits.status,
        amount: sql<string>`CAST(COALESCE(SUM(CAST(${credits.jumlahPengajuan} AS DECIMAL(30,0))), 0) AS CHAR)`,
      })
      .from(credits)
      .innerJoin(debitors, eq(debitors.id, credits.debitorId))
      .innerJoin(users, eq(users.id, debitors.userId))
      .where(
        and(
          conditions,
          inArray(credits.status, [
            CreditStatusEnum.Pending,
            CreditStatusEnum.Approved,
            CreditStatusEnum.Completed,
          ]),
        ),
      )
      .groupBy(credits.status);
    return {
      totalUsers: companies?.value ?? 0,
      totalDebitor: people?.value ?? 0,
      rows,
    };
  },
};
