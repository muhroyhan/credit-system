import { registrationSchema } from '@web/features/registration/registration.type';
import { describe, expect, it } from 'vitest';

const input = {
  namaLengkap: 'QA Synthetic',
  username: 'qa.synthetic',
  password: 'Synthetic123',
  confirmPassword: 'Synthetic123',
};

describe('REGISTRATION-U browser account contract', () => {
  it('accepts matching strong credentials', () => {
    expect(registrationSchema.safeParse(input).success).toBe(true);
  });
  it.each(['', 'different', 'synthetic123'])(
    'rejects mismatching confirmation %s',
    (confirmPassword) => {
      const result = registrationSchema.safeParse({
        ...input,
        confirmPassword,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) => issue.path[0] === 'confirmPassword',
          ),
        ).toBe(true);
      }
    },
  );
  it.each([
    'weakpass',
    'WEAKPASS1',
    'weakpass1',
    'Weakpass',
    'Aa1',
    'x'.repeat(73),
  ])('rejects a password outside registration rules %s', (password) => {
    expect(
      registrationSchema.safeParse({
        ...input,
        password,
        confirmPassword: password,
      }).success,
    ).toBe(false);
  });
});
