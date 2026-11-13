/** Shared runtime choices; values are stable API strings. */
export const PermissionActionEnum = {
  Read: 'READ',
  Create: 'CREATE',
  Update: 'UPDATE',
  Delete: 'DELETE',
  Approval: 'APPROVAL',
} as const;

export type PermissionActionEnum =
  (typeof PermissionActionEnum)[keyof typeof PermissionActionEnum];
