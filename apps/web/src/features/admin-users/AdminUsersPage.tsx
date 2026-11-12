import { Stack, Text } from "@mantine/core";
import { Link, Navigate } from "@tanstack/react-router";
import { AdminUsers } from "@web/features/admin-users/AdminUsers";
import { useSession } from "@web/features/auth/useSession";
export function AdminUsersPage({ embedded = false }: { embedded?: boolean }) {
  const { session } = useSession();
  if (!session) return <Navigate to="/login" replace />;
  const roles = Array.isArray(session.userData.roles)
    ? (session.userData.roles as { program?: string; value?: string }[])
    : [];
  const allowed =
    session.type === "admin" &&
    roles.some(
      (r) => r.program === "USA" && (r.value === "READ" || r.value === "WRITE"),
    );
  if (!allowed) return embedded ? null : <Text>Akses ditolak</Text>;
  return (
    <Stack>
      {embedded ? (
        <Link to="/admin-users">Halaman Admin User</Link>
      ) : (
        <Link to="/">Kembali</Link>
      )}
      <AdminUsers
        token={session.authToken}
        canWrite={roles.some((r) => r.program === "USA" && r.value === "WRITE")}
      />
    </Stack>
  );
}
