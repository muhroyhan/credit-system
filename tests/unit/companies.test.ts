import {
  companyCreateSchema,
  companyExpenseSchema,
  companyInputSchema,
  companyInterestSchema,
  companyQuerySchema,
} from '@credit/contracts';
import { describe, expect, it } from 'vitest';

describe('company configuration validation', () => {
  it('validates percentage/tenor and preserves fractional interest', () => {
    expect(
      companyInterestSchema.parse({
        bungaPercentage: '0.75',
        jangkaWaktuBulan: '12',
      }).bungaPercentage,
    ).toBe('0.75');
    expect(
      companyInterestSchema.safeParse({
        bungaPercentage: 'NaN',
        jangkaWaktuBulan: '0',
      }).success,
    ).toBe(false);
  });
  it('requires create password and accepts empty configuration', () => {
    const input = {
      entityTypeId: 1,
      companyName: 'Synthetic',
      username: 'synthetic',
      email: 'synthetic@example.invalid',
      slug: 'synthetic',
      status: 'active',
      bungaKredits: [],
      biaya: [],
    };
    expect(companyInputSchema.safeParse(input).success).toBe(true);
    expect(companyCreateSchema.safeParse(input).success).toBe(false);
  });
});

describe('COMPANY-U field partitions', () => {
  const input = {
    entityTypeId: 1,
    companyName: 'Synthetic',
    username: 'synthetic',
    email: 'qa@example.invalid',
    slug: 'qa-company',
    status: 'active',
    password: 'Synthetic123',
    bungaKredits: [],
    biaya: [],
  };
  it.each(['active', 'inactive', 'blocked'])('accepts %s company', (status) => {
    expect(companyCreateSchema.safeParse({ ...input, status }).success).toBe(
      true,
    );
  });
  it.each([
    { slug: 'Uppercase' },
    { slug: '-leading' },
    { slug: 'trailing-' },
    { slug: 'double--dash' },
    { slug: 'has space' },
    { slug: '' },
    { entityTypeId: 0 },
    { companyName: '' },
    { email: 'bad' },
    { status: 'deleted' },
    { password: 'x'.repeat(73) },
  ])('rejects invalid company %j', (patch) => {
    expect(companyCreateSchema.safeParse({ ...input, ...patch }).success).toBe(
      false,
    );
  });
  it.each([
    ['0', '1', true],
    ['0.75', '12', true],
    ['-1', '12', false],
    ['Infinity', '12', false],
    ['1', '0', false],
    ['1', '1.5', false],
    ['1', '-12', false],
    ['1', 'NaN', false],
  ])(
    'validates interest %s and tenor %s',
    (bungaPercentage, jangkaWaktuBulan, valid) => {
      expect(
        companyInterestSchema.safeParse({ bungaPercentage, jangkaWaktuBulan })
          .success,
      ).toBe(valid);
    },
  );
  it.each([0, 2147483647])('accepts expense integer boundary %s', (value) => {
    expect(
      companyExpenseSchema.safeParse({ expenseType: 'Admin', type: '%', value })
        .success,
    ).toBe(true);
  });
  it.each([-1, 1.5, 2147483648, NaN, Infinity])(
    'rejects expense value %s',
    (value) => {
      expect(
        companyExpenseSchema.safeParse({
          expenseType: 'Admin',
          type: '%',
          value,
        }).success,
      ).toBe(false);
    },
  );
  it.each([
    { page: '0' },
    { limit: '101' },
    { entityTypeId: '-1' },
    { status: 'unknown' },
    { sortBy: 'password' },
  ])('rejects listing %j', (query) => {
    expect(companyQuerySchema.safeParse(query).success).toBe(false);
  });
});
