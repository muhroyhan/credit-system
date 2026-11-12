import { Alert } from "@mantine/core";
import { Navigate } from "@tanstack/react-router";
import { useSession } from "@web/features/auth/hooks/useSession";
import { type CrudaAction, crudaAccess } from "@web/utils/cruda";
import type { ReactNode } from "react";
export function AccessGate({
  program,
  action,
  children,
}: {
  program: string;
  action: CrudaAction;
  children: ReactNode;
}) {
  const { session } = useSession();
  if (!session) return <Navigate to="/login" replace />;
  if (!crudaAccess(session, program)[action])
    return <Alert color="red">Akses ditolak</Alert>;
  return children;
}
