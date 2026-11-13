import type { CreditApplication, CreditApproval } from '@credit/contracts';
import type { AppType } from '@credit/server/app';
import type { ApiResponse } from '@web/constant/interface';
import { apiErrorSchema } from '@web/constant/schema';
import type { ExportFormat } from '@web/constant/type';
import {
  creditListSchema,
  creditRatesSchema,
  creditRowSchema,
  creditSimulationSchema,
} from '@web/features/credit/credit.type';
import { hc } from 'hono/client';

const api = hc<AppType>(window.location.origin).api.credit;
function options(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } };
}
async function read(response: ApiResponse) {
  const body = await response.json();
  if (!response.ok) {
    throw new Error(
      apiErrorSchema.safeParse(body).data?.error ?? 'Operasi gagal',
    );
  }
  return body;
}
export async function listCredits(token: string, query: URLSearchParams) {
  return creditListSchema.parse(
    await read(
      await api.list.$get(
        { query: Object.fromEntries(query) } as never,
        options(token),
      ),
    ),
  );
}
export async function detailCredit(token: string, id: number) {
  return creditRowSchema.parse(
    await read(
      await api.detail.$get(
        { query: { id: String(id) } } as never,
        options(token),
      ),
    ),
  );
}
export async function creditRates(token: string, id: number) {
  return creditRatesSchema.parse(
    await read(
      await api.rates.$get(
        { query: { id: String(id) } } as never,
        options(token),
      ),
    ),
  );
}
export async function saveCredit(
  token: string,
  input: CreditApplication,
  id?: number,
) {
  return read(
    id
      ? await api.update.$put(
          { json: { ...input, id } } as never,
          options(token),
        )
      : await api.create.$post({ json: input } as never, options(token)),
  );
}
export async function approveCredit(token: string, input: CreditApproval) {
  return read(await api.update.$put({ json: input } as never, options(token)));
}
export async function simulateCredit(token: string, input: CreditApplication) {
  return creditSimulationSchema.parse(
    await read(
      await api.simulation.$post({ json: input } as never, options(token)),
    ),
  );
}
export async function exportCredits(
  token: string,
  query: URLSearchParams,
  format: ExportFormat,
) {
  const params = new URLSearchParams(query);
  params.set('format', format);
  const response = await api.export.$get(
    { query: Object.fromEntries(params) } as never,
    options(token),
  );
  if (!response.ok) {
    throw new Error('Unduhan gagal');
  }
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = `credits.${format}`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
