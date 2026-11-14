import { Box, Container, Paper, Stack } from '@mantine/core';
import type { ReactNode } from 'react';

/** Provides the shared public form surface without changing authentication flows. */
export function PublicPage({ children }: { children: ReactNode }) {
  return (
    <Box
      component="main"
      bg="#F0F0F0"
      mih="100dvh"
      py={{ base: 'xl', sm: 64 }}
      px="md"
    >
      <Container size={480} px={0}>
        <Paper bg="white" p={{ base: 'lg', sm: 'xl' }} withBorder>
          <Stack gap="lg">{children}</Stack>
        </Paper>
      </Container>
    </Box>
  );
}
