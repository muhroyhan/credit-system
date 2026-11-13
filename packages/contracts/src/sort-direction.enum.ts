/** Shared runtime choices; values are stable API strings. */
export const SortDirectionEnum = {
  Ascending: 'asc',
  Descending: 'desc',
} as const;

export type SortDirectionEnum =
  (typeof SortDirectionEnum)[keyof typeof SortDirectionEnum];
