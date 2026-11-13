import { creditUpdateRequestSchema } from '@credit/contracts';
import { describe, expect, it } from 'vitest';

describe('HRD decision input', () => {
  it('accepts only the two decisions and no unrelated fields', () => {
    expect(
      creditUpdateRequestSchema.safeParse({ id: 1, status: 'approved' })
        .success,
    ).toBe(true);
    expect(
      creditUpdateRequestSchema.safeParse({ id: 1, status: 'rejected' })
        .success,
    ).toBe(true);
    expect(
      creditUpdateRequestSchema.safeParse({ id: 1, status: 'pending' }).success,
    ).toBe(false);
    expect(
      creditUpdateRequestSchema.safeParse({ id: 1, status: 'completed' })
        .success,
    ).toBe(false);
    expect(
      creditUpdateRequestSchema.safeParse({
        id: 1,
        status: 'approved',
        jumlahPengajuan: '1',
      }).success,
    ).toBe(false);
  });
});
