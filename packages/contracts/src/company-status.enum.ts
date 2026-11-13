/** Shared runtime choices; values are stable API strings. */
export const CompanyStatusEnum = {
  Active: 'active',
  Inactive: 'inactive',
  Blocked: 'blocked',
} as const;

export type CompanyStatusEnum =
  (typeof CompanyStatusEnum)[keyof typeof CompanyStatusEnum];
