import { toExportQuery, toSearchParams } from '@web/utils/search-params';
import { describe, expect, it } from 'vitest';

describe('listing query serialization', () => {
  it('exports the same filters without mutating the listing parameters', () => {
    const filters = toSearchParams({
      page: 2,
      nama: 'A & B',
      status: undefined,
    });
    filters.set('format', 'pdf');
    expect(toExportQuery(filters, 'xlsx')).toEqual({
      page: '2',
      nama: 'A & B',
      format: 'xlsx',
    });
    expect(filters.get('format')).toBe('pdf');
    expect(filters.has('status')).toBe(false);
  });

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
