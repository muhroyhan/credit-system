/** Shared runtime choices; values are stable API strings. */
export const AccountTypeEnum = {
  Admin: 'admin',
  Company: 'company',
  Debitor: 'debitor',
} as const;

export type AccountTypeEnum =
  (typeof AccountTypeEnum)[keyof typeof AccountTypeEnum];
