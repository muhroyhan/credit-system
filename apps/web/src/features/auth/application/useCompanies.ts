import { getSlugs } from "@web/features/auth/data/gateway";
import { useEffect, useState } from "react";
export function useCompanies(type: "admin" | "company" | "debitor") {
  const [companies, setCompanies] = useState<
    { value: string; label: string }[]
  >([]);
  const [companyError, setCompanyError] = useState("");
  useEffect(() => {
    if (type === "admin") return;
    let active = true;
    setCompanyError("");
    getSlugs()
      .then((items) => {
        if (active)
          setCompanies(
            items
              .filter((v) => v.slug)
              .map((v) => ({
                value: v.slug as string,
                label: v.companyName ?? (v.slug as string),
              })),
          );
      })
      .catch(() => {
        if (active) setCompanyError("Gagal memuat daftar perusahaan");
      });
    return () => {
      active = false;
    };
  }, [type]);
  return { companies, companyError };
}
