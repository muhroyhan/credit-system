import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type AdminInput,
  adminDetail,
  deleteAdmin,
  listAdmins,
  programs,
  saveAdmin,
} from "@web/features/admin-users/data/gateway";
import { useState } from "react";
export function useAdminUsers(token: string) {
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const key = ["admin-users", token] as const;
  const list = useQuery({
    queryKey: [...key, "list", { page, username, email, active }],
    queryFn: () => {
      const query = new URLSearchParams({
        page: String(page),
        limit: "20",
        username,
        email,
      });
      if (active) query.set("active", active);
      return listAdmins(token, query);
    },
  });
  const programQuery = useQuery({
    queryKey: ["programs", token],
    queryFn: () => programs(token),
  });
  const saveMutation = useMutation({
    mutationFn: ({ input, id }: { input: AdminInput; id?: number }) =>
      saveAdmin(token, input, id),
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdmin(token, id),
    onSuccess: async (_, id) => {
      client.removeQueries({ queryKey: [...key, "detail", id] });
      await client.invalidateQueries({ queryKey: key });
    },
  });
  async function save(input: AdminInput, id?: number) {
    deleteMutation.reset();
    try {
      await saveMutation.mutateAsync({ input, id });
      return true;
    } catch {
      return false;
    }
  }
  async function remove(id: number) {
    saveMutation.reset();
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      /* Error is displayed by the mutation state. */
    }
  }
  return {
    rows: list.data?.data ?? [],
    total: list.data?.count ?? 0,
    page,
    setPage,
    username,
    setUsername,
    email,
    setEmail,
    active,
    setActive,
    options: (programQuery.data ?? []).map((p) => ({
      value: String(p.id),
      label: p.name ?? String(p.id),
    })),
    error:
      (
        saveMutation.error ??
        deleteMutation.error ??
        list.error ??
        programQuery.error
      )?.message ?? "",
    loading: list.isFetching,
    saving: saveMutation.isPending,
    deleting: deleteMutation.isPending,
    save,
    remove,
    detail: (id: number) =>
      client.fetchQuery({
        queryKey: [...key, "detail", id],
        queryFn: () => adminDetail(token, id),
      }),
  };
}
