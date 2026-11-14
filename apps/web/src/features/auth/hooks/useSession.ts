import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Session } from '@web/constant/type';
import { signIn } from '@web/features/auth/auth.api';
import {
  readStoredSession,
  writeStoredSession,
} from '@web/features/auth/auth-session';

const sessionKey = ['session'] as const;
export function useSession() {
  const client = useQueryClient();
  const { data: session = null } = useQuery<Session | null>({
    queryKey: sessionKey,
    queryFn: () => null,
    initialData: () => {
      try {
        return readStoredSession(window.sessionStorage);
      } catch {
        return null;
      }
    },
    enabled: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });
  const mutation = useMutation({
    mutationFn: signIn,
    onSuccess: (data) => {
      try {
        writeStoredSession(window.sessionStorage, data);
      } catch {
        // Access to sessionStorage itself may be blocked.
      }
      client.setQueryData(sessionKey, data);
    },
  });
  return {
    session,
    loading: mutation.isPending,
    error: mutation.error?.message ?? '',
    login: mutation.mutate,
    logout: () => {
      try {
        writeStoredSession(window.sessionStorage, null);
      } catch {
        // Access to sessionStorage itself may be blocked.
      }
      void client.cancelQueries();
      client.setQueryData(sessionKey, null);
      client.removeQueries({
        predicate: (query) => query.queryKey[0] !== 'session',
      });
      client.getMutationCache().clear();
      mutation.reset();
    },
  };
}
