import { toSearchParams } from '@web/utils/search-params';
import { describe, expect, it } from 'vitest';

describe('listing query serialization', () => {
  it('omits absent and cleared filters while keeping defined values', () => {
    const params = toSearchParams({
      page: 1,
      limit: 20,
      nama: undefined,
      username: '',
      status: 'false',
      id: 0,
    });
    expect(params.toString()).toBe('page=1&limit=20&status=false&id=0');
  });
});
