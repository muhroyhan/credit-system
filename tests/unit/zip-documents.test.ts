import type { DocumentStorage, ZipDocument } from '@server/constant/interface';
import { zipDocuments } from '@server/utils/zip-documents';
import JSZip from 'jszip';
import { describe, expect, it, vi } from 'vitest';

const entry: ZipDocument = {
  id: 1,
  debitorId: 2,
  companyName: 'Company',
  createdAt: new Date('2026-01-01T00:00:00+07:00'),
  key: 'agreements/1/00000000-0000-4000-8000-000000000000.pdf',
};
function storage(): DocumentStorage {
  return {
    put: async () => {},
    remove: async () => {},
    get: vi.fn(async () => new TextEncoder().encode('%PDF-1.4 synthetic')),
  };
}

describe('EXPORT-U private ZIP archive', () => {
  it('contains exact filenames and original bytes', async () => {
    const bytes = await zipDocuments([entry], storage());
    expect(bytes).not.toBeNull();
    const archive = await JSZip.loadAsync(bytes ?? new Uint8Array());
    const name = 'debitor-2_credit-1_Company_2026-01.pdf';
    expect(Object.keys(archive.files)).toEqual([name]);
    expect(await archive.file(name)?.async('string')).toBe(
      '%PDF-1.4 synthetic',
    );
  });
  it('returns a parseable empty archive without reading storage', async () => {
    const files = storage();
    const bytes = await zipDocuments([], files);
    const archive = await JSZip.loadAsync(bytes ?? new Uint8Array());
    expect(Object.keys(archive.files)).toEqual([]);
    expect(files.get).not.toHaveBeenCalled();
  });
  it('reads at most five files concurrently across batches', async () => {
    let active = 0;
    let maximum = 0;
    const files = storage();
    files.get = async () => {
      active++;
      maximum = Math.max(maximum, active);
      await new Promise((resolve) => setTimeout(resolve, 1));
      active--;
      return new Uint8Array([1]);
    };
    const entries = Array.from({ length: 11 }, (_, i) => ({
      ...entry,
      id: i + 1,
      key: `agreements/${i + 1}/00000000-0000-4000-8000-000000000000.pdf`,
    }));
    const archive = await JSZip.loadAsync(
      (await zipDocuments(entries, files)) ?? new Uint8Array(),
    );
    expect(maximum).toBe(5);
    expect(Object.keys(archive.files)).toHaveLength(11);
  });
  it.each([
    null,
    '../unsafe',
    'https://example.invalid/doc.pdf',
    'agreements/2/00000000-0000-4000-8000-000000000000.pdf',
  ])(
    'rejects untrusted or foreign private key %s without a read',
    async (key) => {
      const files = storage();
      expect(await zipDocuments([{ ...entry, key }], files)).toBeNull();
      expect(files.get).not.toHaveBeenCalled();
    },
  );
  it('fails the archive when an expected file is missing', async () => {
    const files = storage();
    files.get = async () => null;
    expect(await zipDocuments([entry], files)).toBeNull();
  });
  it('propagates storage errors', async () => {
    const files = storage();
    files.get = async () => {
      throw new Error('synthetic storage failure');
    };
    await expect(zipDocuments([entry], files)).rejects.toThrow(
      'synthetic storage failure',
    );
  });
  it('sanitizes company names and substitutes missing identities', async () => {
    const bytes = await zipDocuments(
      [{ ...entry, companyName: '../', debitorId: null }],
      storage(),
    );
    const archive = await JSZip.loadAsync(bytes ?? new Uint8Array());
    expect(Object.keys(archive.files)).toEqual([
      'debitor-unknown_credit-1_perusahaan_2026-01.pdf',
    ]);
  });
});
