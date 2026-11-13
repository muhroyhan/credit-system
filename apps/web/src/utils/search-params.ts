import type { ExportFormat } from '@web/constant/type';

/** Copies listing filters before adding the export format. */
export function toExportQuery(filters: URLSearchParams, format: ExportFormat) {
  const params = new URLSearchParams(filters);
  params.set('format', format);
  return Object.fromEntries(params);
}

/** Serializes defined query values for list and export requests. */
export function toSearchParams(
  values: Record<string, string | number | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  }
  return params;
}
