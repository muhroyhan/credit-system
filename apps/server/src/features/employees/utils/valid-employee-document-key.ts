export function validEmployeeDocumentKey(key: string) {
  return /^\d+\/[a-f0-9-]{36}\.(pdf|png|jpg)$/.test(key);
}
