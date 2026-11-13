import type {
  CreditApplication,
  CreditApproval,
  CreditConfirmation,
  ExportTypeEnum,
} from '@credit/contracts';
import {
  agreementResultSchema,
  creditListSchema,
  creditRatesSchema,
  creditRowSchema,
  creditSimulationSchema,
  creditStatusSchema,
} from '@web/features/credit/credit.type';
import { apiClient, apiOptions, readApiResponse } from '@web/utils/api-client';
import { downloadFile } from '@web/utils/download-file';
import { toExportQuery } from '@web/utils/search-params';

const api = apiClient.api.credit;
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
  format: ExportTypeEnum,
) {
  const response = await api.export.$get(
    { query: toExportQuery(query, format) } as never,
    apiOptions(token),
  );
  await downloadFile(response, `credits.${format}`, 'Unduhan gagal');
}

export async function creditStatus(token: string, id: number) {
  return creditStatusSchema.parse(
    await readApiResponse(
      await api.status.$get(
        { query: { id: String(id) } } as never,
        apiOptions(token),
      ),
    ),
  );
}
export async function cancelCredit(token: string, id: number) {
  return readApiResponse(
    await api.cancel.$put({ json: { id } } as never, apiOptions(token)),
  );
}
export async function confirmCredit(token: string, input: CreditConfirmation) {
  return readApiResponse(
    await api.confirm.$put({ json: input } as never, apiOptions(token)),
  );
}

export async function generateAgreement(token: string, id: number) {
  return agreementResultSchema.parse(
    await readApiResponse(
      await api.doc.render.$post({ json: { id } } as never, apiOptions(token)),
    ),
  );
}
export async function downloadAgreement(token: string, id: number) {
  await downloadFile(
    await api.doc.$get(
      { query: { id: String(id) } } as never,
      apiOptions(token),
    ),
    `agreement-${id}.pdf`,
  );
}

export async function exportCreditZip(token: string, query: URLSearchParams) {
  await downloadFile(
    await api['export-zip'].$get(
      { query: Object.fromEntries(query) } as never,
      apiOptions(token),
    ),
    'credit-documents.zip',
  );
}
