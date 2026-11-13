/** Shared runtime choices; values are stable API strings. */
export const CreditStatusEnum = {
  Pending: 'pending',
  Approved: 'approved',
  Rejected: 'rejected',
  Completed: 'completed',
} as const;

export type CreditStatusEnum =
  (typeof CreditStatusEnum)[keyof typeof CreditStatusEnum];
