import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  companyDetail,
  deleteCompany,
  entities,
  exportCompanies,
  listCompanies,
  saveCompany,
} from "@web/features/companies/companies.api";
import {
  type CompanyInput,
  companyFormSchema,
  type ExportFormat,
} from "@web/features/companies/companies.type";
import { useState } from "react";
import { useForm } from "react-hook-form";
export function useCompanyDetail(token: string, id: number) {
  return useQuery({
    queryKey: ["companies", token, "detail", id],
    queryFn: () => companyDetail(token, id),
    enabled: Number.isInteger(id) && id > 0,
  });
}
export function useEntities(token: string) {
  return useQuery({
    queryKey: ["entities", token],
    queryFn: () => entities(token),
  });
}
export function useCompanyForm(
  token: string,
  id?: number,
  initial?: CompanyInput,
) {
  const form = useForm<CompanyInput>({
    resolver: zodResolver(companyFormSchema(!!id)),
    mode: "onTouched",
    defaultValues: initial ?? {
      entityTypeId: 0,
      companyName: "",
      username: "",
      email: "",
      slug: "",
      password: "",
      status: "active",
      bungaKredits: [],
      biaya: [],
    },
  });
  const client = useQueryClient();
  const navigate = useNavigate();
  const save = useMutation({
    mutationFn: (input: CompanyInput) =>
      saveCompany(
        token,
        { ...input, password: input.password || undefined },
        id,
      ),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["companies", token] });
      await client.invalidateQueries({ queryKey: ["companies"] });
      await navigate({ to: "/companies" });
    },
  });
  return { form, save };
}
export function useCompanies(token: string) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    companyName: "",
    username: "",
    email: "",
    status: "",
    entityTypeId: "",
    sortBy: "createdAt",
    sortDirection: "desc",
  });
  const query = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => !!v),
  );
  const list = useQuery({
    queryKey: ["companies", token, "list", query.toString(), page],
    queryFn: () =>
      listCompanies(
        token,
        new URLSearchParams({
          ...Object.fromEntries(query),
          page: String(page),
          limit: "20",
        }),
      ),
  });
  const client = useQueryClient();
  const remove = useMutation({
    mutationFn: (id: number) => deleteCompany(token, id),
    onSuccess: async () => {
      if (list.data?.data.length === 1 && page > 1) setPage(page - 1);
      await client.invalidateQueries({ queryKey: ["companies"] });
    },
  });
  const exporting = useMutation({
    mutationFn: (format: ExportFormat) => exportCompanies(token, query, format),
  });
  return {
    list,
    page,
    setPage,
    filters,
    filter: (key: keyof typeof filters, value: string) => {
      setFilters((v) => ({ ...v, [key]: value }));
      setPage(1);
    },
    remove,
    exporting,
  };
}
