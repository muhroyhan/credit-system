import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type Session, signIn } from "@web/features/auth/auth.api";

const sessionKey = ["session"] as const;
export function useSession() {
  const client = useQueryClient();
  const { data: session = null } = useQuery<Session | null>({
    queryKey: sessionKey,
    queryFn: () => null,
    initialData: null,
    enabled: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });
  const mutation = useMutation({
    mutationFn: signIn,
    onSuccess: (data) => {
      client.setQueryData(sessionKey, data);
    },
  });
  return {
    session,
    loading: mutation.isPending,
    error: mutation.error?.message ?? "",
    login: mutation.mutate,
    logout: () => {
      void client.cancelQueries();
      client.setQueryData(sessionKey, null);
      client.removeQueries({
        predicate: (query) => query.queryKey[0] !== "session",
      });
      client.getMutationCache().clear();
      mutation.reset();
    },
  };
}
