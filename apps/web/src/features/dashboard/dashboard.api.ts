import { dashboardSchema } from '@web/features/dashboard/dashboard.type';
import { apiClient, apiOptions, readApiResponse } from '@web/utils/api-client';
export async function getDashboard(token: string) {
  return dashboardSchema.parse(
    await readApiResponse(
      await apiClient.api.dashboard.data.$get({}, apiOptions(token)),
    ),
  );
}
