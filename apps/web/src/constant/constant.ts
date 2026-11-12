import { adminRoleSchema } from "@credit/contracts";
export const PERMISSION_OPTIONS = adminRoleSchema.shape.value.options.map(
  (value) => ({ value, label: value }),
);
export const EXPORT_FORMATS = ["pdf", "xlsx"] as const;
