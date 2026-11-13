import {
  constantSchema,
  constantsQuerySchema,
  countrySchema,
  programSchema,
  slugSchema,
} from '@credit/contracts';
import { expect, it } from 'vitest';

it('maps public slugs and validates query', () => {
  expect(
    slugSchema.parse({
      id: 1,
      slug: 'tenant',
      companyName: 'Tenant',
      password: 'hidden',
    }),
  ).toEqual({ id: 1, slug: 'tenant', companyName: 'Tenant' });
  expect(constantsQuerySchema.parse({ name: 'option' }).name).toBe('option');
});

it('REFERENCE-U preserves nullable legacy values while stripping internal columns', () => {
  expect(
    slugSchema.parse({
      id: 1,
      slug: null,
      companyName: null,
      password: 'hidden',
    }),
  ).toEqual({ id: 1, slug: null, companyName: null });
  expect(
    programSchema.parse({ id: 1, name: null, abbreviation: null }),
  ).toMatchObject({ name: null });
  expect(countrySchema.parse({ id: 1, value: null, code: null })).toMatchObject(
    { code: null },
  );
  expect(
    constantSchema.parse({ id: 1, value: null, name: null, type: null }),
  ).toMatchObject({ type: null });
  expect(constantsQuerySchema.parse({})).toEqual({});
});
