import type { DocumentStorage, ZipDocument } from '@server/constant/interface';
import JSZip from 'jszip';

/** Reads server-generated private PDF keys in bounded batches and builds a ZIP. */
export async function zipDocuments(
  entries: ZipDocument[],
  storage: DocumentStorage,
) {
  const archive = new JSZip();
  for (let start = 0; start < entries.length; start += 5) {
    const batch = entries.slice(start, start + 5);
    const files = await Promise.all(
      batch.map(async ({ id, key, debitorId, companyName, createdAt }) => {
        if (
          !key ||
          !new RegExp(`^agreements/${id}/[a-f0-9-]{36}\\.pdf$`).test(key)
        ) {
          return null;
        }
        const bytes = await storage.get(key);
        const company =
          (companyName ?? 'perusahaan')
            .replace(/[^a-zA-Z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 80) || 'perusahaan';
        const month = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
        return bytes
          ? {
              name: `debitor-${debitorId ?? 'unknown'}_credit-${id}_${company}_${month}.pdf`,
              bytes,
            }
          : null;
      }),
    );
    if (files.some((file) => file === null)) {
      return null;
    }
    for (const file of files) {
      if (file) {
        archive.file(file.name, file.bytes);
      }
    }
  }
  return archive.generateAsync({ type: 'uint8array' });
}
