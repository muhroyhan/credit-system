import { creditQuerySchema, ExportTypeEnum } from '@credit/contracts';
import { exportFormatSchema } from '@server/constant/schema';
import { describe, expect, it } from 'vitest';

describe('export query validation', () => {
  const schema = creditQuerySchema.extend({ format: exportFormatSchema });
  it('parses the format together with listing filters', () => {
    const result = schema.parse({ format: 'csv', nama: 'Satu', page: '2' });
    expect(result).toMatchObject({
      format: ExportTypeEnum.CSV,
      nama: 'Satu',
      page: 2,
    });
  });
  it('rejects missing and unsupported formats', () => {
    expect(schema.safeParse({}).success).toBe(false);
    expect(schema.safeParse({ format: 'zip' }).success).toBe(false);
  });
});
