import { bodyLimit } from 'hono/body-limit';
export const documentBodyLimit = bodyLimit({
  maxSize: 64 * 1024 * 1024,
  onError: (c) => c.json({ error: 'Dokumen terlalu besar' }, 413),
});
