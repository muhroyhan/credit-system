import { Box, Stack, Title } from '@mantine/core';
import type { ReactNode } from 'react';

/** Separates independently saved form content while constraining reading width. */
export function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Box component="section" maw={960} w="100%">
      <Stack gap="lg">
        <Title order={2} size="h3">
          {title}
        </Title>
        {children}
      </Stack>
    </Box>
  );
}
