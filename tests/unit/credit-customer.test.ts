import { creditConfirmationSchema } from '@credit/contracts';
import { describe, expect, it } from 'vitest';

const confirmation = {
  id: 1,
  bankName: 'Bank',
  bankBranch: 'Jakarta',
  bankAccountName: 'Nasabah',
  bankAccountNumber: '001234',
  confirmationName: 'Nasabah',
  confirmed: true,
};

describe('CUSTOMER-U confirmation contract', () => {
  it('accepts consent and preserves leading zeroes', () => {
    expect(creditConfirmationSchema.parse(confirmation)).toEqual(confirmation);
  });
  it('trims account fields without normalizing the exact confirmation name', () => {
    expect(
      creditConfirmationSchema.parse({
        ...confirmation,
        bankName: ' Bank ',
        confirmationName: ' Nasabah ',
      }),
    ).toMatchObject({ bankName: 'Bank', confirmationName: ' Nasabah ' });
  });
  it.each([
    'bankName',
    'bankBranch',
    'bankAccountName',
    'bankAccountNumber',
    'confirmationName',
  ])('requires %s', (field) => {
    expect(
      creditConfirmationSchema.safeParse({ ...confirmation, [field]: '' })
        .success,
    ).toBe(false);
  });
  it.each([
    { confirmed: false },
    { confirmed: 'true' },
    { confirmed: undefined },
    { id: 0 },
    { bankAccountNumber: 123 },
    { debitorAcknowledgmentTimestamp: '2000-01-01' },
    { status: 'approved' },
    { bankName: 'x'.repeat(256) },
  ])('rejects invalid or server-owned field %j', (patch) => {
    expect(
      creditConfirmationSchema.safeParse({ ...confirmation, ...patch }).success,
    ).toBe(false);
  });
});
