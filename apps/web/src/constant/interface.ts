export interface ApiResponse {
  ok: boolean;
  json: () => Promise<unknown>;
}
