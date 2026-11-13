import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createDocumentStorage } from '@server/utils/document-storage';
import { expect, it } from 'vitest';

it('STORAGE-I persists bytes, prevents overwrite and removes missing files idempotently', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'credit-qa-'));
  try {
    const storage = createDocumentStorage(directory);
    const key = 'agreements/1/synthetic.pdf';
    const original = new Uint8Array([0, 128, 255]);
    expect(await storage.get(key)).toBeNull();
    await storage.put(key, original);
    expect(await storage.get(key)).toEqual(original);
    await expect(storage.put(key, new Uint8Array([1]))).rejects.toThrow();
    expect(await storage.get(key)).toEqual(original);
    await storage.remove(key);
    await storage.remove(key);
    expect(await storage.get(key)).toBeNull();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
