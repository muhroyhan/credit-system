import {
  type Admin,
  type AdminInput,
  adminDetail,
  deleteAdmin,
  listAdmins,
  programs,
  saveAdmin,
} from "@web/features/admin-users/data/gateway";
import { useCallback, useEffect, useState } from "react";
export function useAdminUsers(token: string) {
  const [rows, setRows] = useState<Admin[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: "20",
        username,
        email,
      });
      if (active) query.set("active", active);
      const result = await listAdmins(token, query);
      setRows(result.data);
      setTotal(result.count);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [token, page, username, email, active]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    programs(token)
      .then((items) =>
        setOptions(
          items.map((p) => ({
            value: String(p.id),
            label: p.name ?? String(p.id),
          })),
        ),
      )
      .catch(() => setError("Gagal memuat program"));
  }, [token]);
  async function save(input: AdminInput, id?: number) {
    setError("");
    try {
      await saveAdmin(token, input, id);
      await load();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
      return false;
    }
  }
  async function remove(id: number) {
    try {
      await deleteAdmin(token, id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus");
    }
  }
  return {
    rows,
    total,
    page,
    setPage,
    username,
    setUsername,
    email,
    setEmail,
    active,
    setActive,
    options,
    error,
    loading,
    save,
    remove,
    detail: (id: number) => adminDetail(token, id),
  };
}
