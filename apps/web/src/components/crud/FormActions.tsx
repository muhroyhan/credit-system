import { Button, Group } from "@mantine/core";
import type { ReactNode } from "react";
export function FormActions({
  pending,
  disabled,
  cancel,
}: {
  pending: boolean;
  disabled?: boolean;
  cancel: ReactNode;
}) {
  return (
    <Group>
      <Button type="submit" loading={pending} disabled={disabled}>
        Simpan
      </Button>
      {cancel}
    </Group>
  );
}
