import { Box, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

export function DetailFields({
  fields,
  title,
}: {
  fields: Array<{ label: string; value: ReactNode }>;
  title?: string;
}) {
  return (
    <Stack component="section" gap="md">
      {title && (
        <Title order={2} size="h3">
          {title}
        </Title>
      )}
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
    </Stack>
  );
}
