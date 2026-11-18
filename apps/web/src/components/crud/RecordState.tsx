import { Alert, Text } from '@mantine/core';
import type { ReactNode } from 'react';

export function RecordState<T>({
  id,
  query,
  pending,
  error,
  children,
}: {
  id: number;
  query: { data?: T; isPending: boolean; error: Error | null };
  pending?: boolean;
  error?: Error | null;
  children: (data: T) => ReactNode;
}) {
  if (!Number.isInteger(id) || id <= 0) {
    return <Alert color="red.8">ID tidak valid</Alert>;
  }
  if (query.isPending || pending) {
    return <Text role="status">Memuat...</Text>;
  }
  if (query.error || error) {
    return <Alert color="red.8">{(query.error ?? error)?.message}</Alert>;
  }
  if (!query.data) {
    return <Alert color="red.8">Data tidak ditemukan</Alert>;
  }
  return children(query.data);
}
