import type {
  CreditApplication,
  CreditApproval,
  CreditReview,
} from '@credit/contracts';
import type { ExportFormat } from '@web/constant/type';
import {
  creditListSchema,
  creditRatesSchema,
  creditReviewDetailSchema,
  creditReviewResultSchema,
  creditRowSchema,
  creditSimulationSchema,
} from '@web/features/credit/credit.type';
import { apiClient, apiOptions, readApiResponse } from '@web/utils/api-client';
import { downloadFile } from '@web/utils/download-file';

const api = apiClient.api.credit;
export async function listReviews(token: string, query: URLSearchParams) {
  return creditListSchema.parse(
    await readApiResponse(
      await api.review.list.$get(
        { query: Object.fromEntries(query) } as never,
        apiOptions(token),
      ),
    ),
  );
}
export async function detailReview(token: string, id: number) {
  return creditReviewDetailSchema.parse(
    await readApiResponse(
      await api.review.detail.$get(
        { query: { id: String(id) } } as never,
        apiOptions(token),
      ),
    ),
  );
}
export async function saveReview(token: string, input: CreditReview) {
  return creditReviewResultSchema.parse(
    await readApiResponse(
      await api.review.$put({ json: input } as never, apiOptions(token)),
    ),
  );
}
export async function exportReviews(
  token: string,
  query: URLSearchParams,
  format: ExportFormat,
) {
  const params = new URLSearchParams(query);
  params.set('format', format);
  await downloadFile(
    await api.review.export.$get(
      { query: Object.fromEntries(params) } as never,
      apiOptions(token),
    ),
    `credit-reviews.${format}`,
  );
}
export async function listCredits(token: string, query: URLSearchParams) {
  return creditListSchema.parse(
    await readApiResponse(
      await api.list.$get(
        { query: Object.fromEntries(query) } as never,
        apiOptions(token),
      ),
    ),
  );
}
export async function detailCredit(token: string, id: number) {
  return creditRowSchema.parse(
    await readApiResponse(
      await api.detail.$get(
        { query: { id: String(id) } } as never,
        apiOptions(token),
      ),
    ),
  );
}
export async function creditRates(token: string, id: number) {
  return creditRatesSchema.parse(
    await readApiResponse(
      await api.rates.$get(
        { query: { id: String(id) } } as never,
        apiOptions(token),
      ),
    ),
  );
}
export async function saveCredit(
  token: string,
  input: CreditApplication,
  id?: number,
) {
  return readApiResponse(
    id
      ? await api.update.$put(
          { json: { ...input, id } } as never,
          apiOptions(token),
        )
      : await api.create.$post({ json: input } as never, apiOptions(token)),
  );
}
export async function approveCredit(token: string, input: CreditApproval) {
  return readApiResponse(
    await api.update.$put({ json: input } as never, apiOptions(token)),
  );
}
export async function simulateCredit(token: string, input: CreditApplication) {
  return creditSimulationSchema.parse(
    await readApiResponse(
      await api.simulation.$post({ json: input } as never, apiOptions(token)),
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
    apiOptions(token),
  );
  await downloadFile(response, `credits.${format}`, 'Unduhan gagal');
}
