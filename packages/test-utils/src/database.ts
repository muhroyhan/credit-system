/** Allows disposable local test databases only; absent URLs keep optional suites skipped. */
export function testDatabaseUrl(url: string | undefined) {
  if (url) {
    const target = new URL(url);
    if (
      !['localhost', '127.0.0.1', '[::1]', '::1'].includes(target.hostname) ||
      !/^\/credit_[a-z0-9_]*test$/.test(target.pathname)
    ) {
      throw new Error('Isolated test database required');
    }
  }
  return url;
}
