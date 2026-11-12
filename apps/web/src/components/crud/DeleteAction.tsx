import { Button } from '@mantine/core';

export function DeleteAction({
  allowed,
  pending,
  message,
  onDelete,
}: {
  allowed: boolean;
  pending: boolean;
  message: string;
  onDelete: () => void;
}) {
  return allowed ? (
    <Button
      color="red"
      disabled={pending}
      onClick={() => {
        if (window.confirm(message)) {
          onDelete();
        }
      }}
    >
      Hapus
    </Button>
  ) : null;
}
