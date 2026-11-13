import type { CreditReview } from '@credit/contracts';
import type { ExportFormat } from '@web/constant/type';
import { creditListSchema } from '@web/features/credit/credit.type';
import {
  creditReviewDetailSchema,
  creditReviewResultSchema,
} from '@web/features/credit-review/credit-review.type';
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
