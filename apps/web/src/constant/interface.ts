export interface ApiResponse {
  ok: boolean;
  json: () => Promise<unknown>;
}
export interface DownloadResponse {
  ok: boolean;
  blob: () => Promise<Blob>;
}

import type { ExportTypeEnum } from '@credit/contracts';
import type { QueryKey } from '@tanstack/react-query';

export interface ListingOptions<TQueries, TData> {
  initialQueries: TQueries;
  queryKey: QueryKey;
  load: (queries: URLSearchParams) => Promise<TData>;
  exportFile: (
    queries: URLSearchParams,
    format: ExportTypeEnum,
  ) => Promise<void>;
  deleteRecord?: (id: number) => Promise<unknown>;
  invalidateKey?: QueryKey;
  detailKey?: (id: number) => QueryKey;
}
