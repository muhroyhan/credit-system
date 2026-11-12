import { Text } from '@mantine/core';
import type { ReactNode } from 'react';

export function DetailFields({
  fields,
}: {
  fields: Array<{ label: string; value: ReactNode }>;
}) {
  return fields.map((field) => (
    <Text key={field.label}>
      {field.label}: {field.value ?? '—'}
    </Text>
  ));
}
