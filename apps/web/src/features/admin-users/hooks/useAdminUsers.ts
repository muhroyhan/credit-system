import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteAdmin,
  exportAdmins,
  listAdmins,
} from "@web/features/admin-users/admin-users.api";
import { exportTable } from "@web/utils/export-table";
import { useState } from "react";
export function useAdminUsers(token: string) {
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const query = new URLSearchParams({ username, email, sortBy, sortDirection });
  if (active) query.set("active", active);
  const filters = query.toString();
  const list = useQuery({
    queryKey: ["admin-users", token, "list", filters, page],
    queryFn: () =>
      listAdmins(
        token,
        new URLSearchParams({
          ...Object.fromEntries(query),
          page: String(page),
          limit: "20",
        }),
      ),
  });
  const remove = useMutation({
    mutationFn: (id: number) => deleteAdmin(token, id),
    onSuccess: async (_, id) => {
      client.removeQueries({ queryKey: ["admin-users", token, "detail", id] });
      if (list.data?.data.length === 1 && page > 1) setPage(page - 1);
      await client.invalidateQueries({ queryKey: ["admin-users", token] });
    },
  });
  const exporting = useMutation({
    mutationFn: async (format: "pdf" | "xlsx") => {
      const rows = await exportAdmins(token, new URLSearchParams(filters));
      await exportTable(
        {
          title: "Admin User",
          filename: "admin-users",
          columns: ["Username", "Email", "Status"],
          rows: rows.map((row) => [
            row.username ?? "",
            row.email ?? "",
            row.isActive ? "Aktif" : "Tidak aktif",
          ]),
        },
        format,
      );
    },
  });
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
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    loading: list.isFetching,
    deleting: remove.isPending,
    exporting: exporting.isPending,
    error: (remove.error ?? exporting.error ?? list.error)?.message ?? "",
    remove: remove.mutate,
    exportRows: exporting.mutate,
  };
}
