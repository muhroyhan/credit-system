import {
  adminListQuerySchema,
  companyQuerySchema,
  creditQuerySchema,
  employeeQuerySchema,
} from '@credit/contracts';
import { describe, expect, it } from 'vitest';

describe.each([
  ['admin', adminListQuerySchema],
  ['company', companyQuerySchema],
  ['employee', employeeQuerySchema],
  ['credit', creditQuerySchema],
] as const)('LISTING-U %s shared boundaries', (_feature, schema) => {
  it('defaults to page one, twenty records and descending creation time', () => {
    expect(schema.parse({})).toMatchObject({
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortDirection: 'desc',
    });
  });
  it.each([1, 100])('accepts inclusive page-size boundary %s', (limit) => {
    expect(schema.parse({ limit: String(limit), page: '2' })).toMatchObject({
      limit,
      page: 2,
    });
  });
  it.each([
    { page: 0 },
    { page: -1 },
    { page: 1.5 },
    { page: 'NaN' },
    { limit: 0 },
    { limit: 101 },
    { limit: 1.5 },
    { sortDirection: 'ASC' },
  ])('rejects invalid pagination or direction %j', (query) => {
    expect(schema.safeParse(query).success).toBe(false);
  });
});
