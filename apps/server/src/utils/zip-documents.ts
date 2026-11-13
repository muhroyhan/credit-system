import type { DocumentStorage } from '@server/constant/interface';
import JSZip from 'jszip';

/** Reads server-generated private PDF keys in bounded batches and builds a ZIP. */
export async function zipDocuments(
  entries: Array<{ id: number; key: string | null }>,
  storage: DocumentStorage,
) {
  const archive = new JSZip();
  for (let start = 0; start < entries.length; start += 5) {
    const batch = entries.slice(start, start + 5);
    const files = await Promise.all(
      batch.map(async ({ id, key }) => {
        if (
          !key ||
          !new RegExp(`^agreements/${id}/[a-f0-9-]{36}\\.pdf$`).test(key)
        ) {
          return null;
        }
        const bytes = await storage.get(key);
        return bytes ? { id, bytes } : null;
      }),
    );
    if (files.some((file) => file === null)) {
      return null;
    }
    for (const file of files) {
      if (file) {
        archive.file(`credit-${file.id}.pdf`, file.bytes);
      }
    }
  }
  return archive.generateAsync({ type: 'uint8array' });
}
