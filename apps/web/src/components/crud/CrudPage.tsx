import { Container, Stack, Title } from "@mantine/core";
import { AccessGate } from "@web/components/AccessGate";
import type { CrudaAction } from "@web/utils/cruda";
import type { ReactNode } from "react";
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
      <Container>
        <Stack>
          <Title>{title}</Title>
          {children}
        </Stack>
      </Container>
    </AccessGate>
  );
}
