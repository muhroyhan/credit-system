import { adminRoleSchema } from '@credit/contracts';

export const PERMISSION_OPTIONS = adminRoleSchema.shape.value.options.map(
  (value) => ({ value, label: value }),
);
