import { Container, Paper, Stack, Title } from '@mantine/core';
import { AccessGate } from '@web/components/AccessGate';
import type { CrudaAction } from '@web/constant/type';
import type { ReactNode } from 'react';

export function CrudPage({
  program,
  action,
  title,
  children,
}: {
  program: string;
  action: CrudaAction;
  title: string;
  children: ReactNode;
}) {
  return (
    <AccessGate program={program} action={action}>
      <Container size="xl" px={0}>
        <Stack>
          <Title order={1}>{title}</Title>
          <Paper p={{ base: 'md', sm: 'xl' }} radius="md" withBorder>
            <Stack gap="xl">{children}</Stack>
          </Paper>
        </Stack>
      </Container>
    </AccessGate>
  );
}
