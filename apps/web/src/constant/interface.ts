export interface ApiResponse {
  ok: boolean;
  json: () => Promise<unknown>;
}
export interface DownloadResponse {
  ok: boolean;
  blob: () => Promise<Blob>;
}
