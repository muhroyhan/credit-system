import { Badge } from '@mantine/core';
import { statusPresentation } from '@web/constant/constant';

/** Adds textual status meaning without inferring transitions or eligibility. */
export function StatusBadge({ value }: { value: string | null | undefined }) {
  const presentation = value ? statusPresentation[value] : undefined;
  return (
    <Badge
      variant="light"
      color={`${presentation?.color ?? 'gray'}.8`}
      style={{ textTransform: 'none' }}
    >
      {presentation?.label ?? value ?? '—'}
    </Badge>
  );
}
