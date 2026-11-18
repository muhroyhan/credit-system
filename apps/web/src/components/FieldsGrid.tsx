import { SimpleGrid } from '@mantine/core';
import type { ReactNode } from 'react';

/** Uses available container width to keep related form fields readable. */
export function FieldsGrid({
  children,
  three = false,
}: {
  children: ReactNode;
  three?: boolean;
}) {
  return (
    <SimpleGrid
      type="container"
      cols={
        three ? { base: 1, '580px': 2, '900px': 3 } : { base: 1, '580px': 2 }
      }
      spacing="md"
      verticalSpacing="lg"
    >
      {children}
    </SimpleGrid>
  );
}
