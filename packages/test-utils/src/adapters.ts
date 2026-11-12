export function createTestAdapters() {
  const notifications: string[] = [];
  const files = new Map<string, Uint8Array>();
  return { notifications, files, storage: { put: (key: string, data: Uint8Array) => { files.set(key, data); return key; } }, whatsapp: { send: (message: string) => { notifications.push(message); } }, pdf: { render: () => new TextEncoder().encode("synthetic pdf") }, now: () => new Date("2025-01-01T00:00:00Z") };
}
