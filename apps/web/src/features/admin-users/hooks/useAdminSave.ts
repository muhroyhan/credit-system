import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { saveAdmin } from "@web/features/admin-users/admin-users.api";
import type { AdminInput } from "@web/features/admin-users/admin-users.type";
export function useAdminSave(token: string, id?: number) {
  const client = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (input: AdminInput) => saveAdmin(token, input, id),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["admin-users", token] });
      await navigate({ to: "/admin-users" });
    },
  });
}
