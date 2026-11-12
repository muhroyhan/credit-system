import { useQuery } from "@tanstack/react-query";
import { getSlugs } from "@web/features/auth/data/gateway";
export function useCompanies(type: "admin" | "company" | "debitor") {
  const query = useQuery({
    queryKey: ["companies"],
    queryFn: getSlugs,
    enabled: type !== "admin",
  });
  return {
    companies: (query.data ?? [])
      .filter((v) => v.slug)
      .map((v) => ({
        value: v.slug as string,
        label: v.companyName ?? (v.slug as string),
      })),
    companyError: query.error ? "Gagal memuat daftar perusahaan" : "",
  };
}
