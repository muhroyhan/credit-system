import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ListingOptions } from '@web/constant/interface';
import type { ExportFormat } from '@web/constant/type';
import { toSearchParams } from '@web/utils/search-params';
import { useState } from 'react';

/** Owns one listing state; feature adapters supply filters, keys and permitted operations. */
export function useListing<
  TQueries extends Record<string, string | number | undefined> & {
    page: number;
  },
  TData extends { data: unknown[]; count: number },
>(options: ListingOptions<TQueries, TData>) {
  const [queries, setQueries] = useState(options.initialQueries);
  const client = useQueryClient();
  const list = useQuery({
    queryKey: [...options.queryKey, queries],
    queryFn: () => options.load(toSearchParams(queries)),
  });
  const exporting = useMutation({
    mutationFn: (format: ExportFormat) =>
      options.exportFile(toSearchParams(queries), format),
  });
  const remove = useMutation({
    mutationFn: async (id: number) => {
      if (!options.deleteRecord) {
        throw new Error('Operasi hapus tidak tersedia');
      }
      return options.deleteRecord(id);
    },
    onSuccess: async (_, id) => {
      if (options.detailKey) {
        client.removeQueries({ queryKey: options.detailKey(id) });
      }
      if (list.data?.data.length === 1) {
        setQueries((current) => ({
          ...current,
          page: Math.max(1, current.page - 1),
        }));
      }
      await client.invalidateQueries({
        queryKey: options.invalidateKey ?? options.queryKey,
      });
    },
  });
  return { queries, setQueries, list, exporting, remove };
}
