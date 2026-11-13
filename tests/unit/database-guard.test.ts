import { testDatabaseUrl } from '@credit/test-utils/database';
import { describe, expect, it } from 'vitest';

describe('HARNESS-U disposable SQL guard', () => {
  it.each(['localhost', '127.0.0.1', '[::1]'])(
    'accepts local test host %s',
    (host) => {
      const url = `mysql://synthetic:synthetic@${host}:3306/credit_qa_test`;
      expect(testDatabaseUrl(url)).toBe(url);
    },
  );
  it.each([
    'mysql://synthetic:synthetic@example.invalid/credit_qa_test',
    'mysql://synthetic:synthetic@localhost/production',
    'mysql://synthetic:synthetic@localhost/credit_development',
    'mysql://synthetic:synthetic@localhost/credit_test_backup',
    'not-a-url',
  ])('rejects non-disposable target %s', (url) => {
    expect(() => testDatabaseUrl(url)).toThrow();
  });
});
