import { Button, Group } from '@mantine/core';
import type { ReactNode } from 'react';

export function FormActions({
  pending,
  label = 'Simpan',
  disabled,
  cancel,
}: {
  pending: boolean;
  label?: string;
  disabled?: boolean;
  cancel: ReactNode;
}) {
  return (
    <Group mt="sm" gap="md">
      <Button type="submit" loading={pending} disabled={disabled}>
        {label}
      </Button>
      {cancel}
    </Group>
  );
}
