import { Box, SimpleGrid, Text } from '@mantine/core';
import type { ReactNode } from 'react';

export function DetailFields({
  fields,
}: {
  fields: Array<{ label: string; value: ReactNode }>;
}) {
  return (
    <SimpleGrid
      type="container"
      cols={{ base: 1, '580px': 2 }}
      spacing="lg"
      component="dl"
      m={0}
    >
      {fields.map((field) => (
        <Box
          key={field.label}
          style={{ minWidth: 0, overflowWrap: 'anywhere' }}
        >
          <Text component="dt" size="sm" c="dimmed">
            {field.label}
          </Text>
          <Text component="dd" m={0} fw={500}>
            {field.value ?? '—'}
          </Text>
        </Box>
      ))}
    </SimpleGrid>
  );
}
