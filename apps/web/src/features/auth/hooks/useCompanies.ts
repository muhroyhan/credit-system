import { useQuery } from '@tanstack/react-query';
import { getSlugs } from '@web/features/auth/auth.api';
import type { AccountType } from '@web/features/auth/auth.type';

export function useCompanies(type: AccountType) {
  const query = useQuery({
    queryKey: ['companies'],
    queryFn: getSlugs,
    enabled: type !== 'admin',
  });
  return {
    companies: (query.data ?? []).flatMap((company) =>
      company.slug
        ? [{ value: company.slug, label: company.companyName ?? company.slug }]
        : [],
    ),
    companyError: query.error ? 'Gagal memuat daftar perusahaan' : '',
  };
}
