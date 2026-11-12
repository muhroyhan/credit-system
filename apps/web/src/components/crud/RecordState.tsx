import { Alert, Text } from "@mantine/core";
import type { ReactNode } from "react";
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
  if (!Number.isInteger(id) || id <= 0)
    return <Alert color="red">ID tidak valid</Alert>;
  if (query.isPending || pending) return <Text>Memuat...</Text>;
  if (query.error || error)
    return <Alert color="red">{(query.error ?? error)?.message}</Alert>;
  if (!query.data) return <Alert color="red">Data tidak ditemukan</Alert>;
  return children(query.data);
}
