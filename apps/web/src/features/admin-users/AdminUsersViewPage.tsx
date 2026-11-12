import { Text, Title } from '@mantine/core';
import { Link, useParams } from '@tanstack/react-router';
import { CrudPage } from '@web/components/crud/CrudPage';
import { DetailFields } from '@web/components/crud/DetailFields';
import { RecordState } from '@web/components/crud/RecordState';
import {
  useAdminDetail,
  useAdminPrograms,
} from '@web/features/admin-users/hooks/useAdminDetail';
import { useSession } from '@web/features/auth/hooks/useSession';

export function AdminUsersViewPage() {
  return (
    <CrudPage program="USA" action="read" title="Detail administrator">
      <ViewContent />
    </CrudPage>
  );
}
function ViewContent() {
  const { session } = useSession();
  const { id } = useParams({ from: '/admin-users/$id' });
  const query = useAdminDetail(session?.authToken ?? '', Number(id));
  const programs = useAdminPrograms(session?.authToken ?? '');

  return (
    <RecordState
      id={Number(id)}
      query={query}
      pending={programs.isPending}
      error={programs.error}
    >
      {(data) => (
        <>
          <DetailFields
            fields={[
              { label: 'Username', value: data.username },
              { label: 'Email', value: data.email },
              {
                label: 'Status',
                value: data.isActive ? 'Aktif' : 'Tidak aktif',
              },
            ]}
          />
          <Title order={2}>Hak akses</Title>
          {data.roles?.length ? (
            data.roles.map((role) => (
              <Text key={`${role.programId}-${role.value}`}>
                {programs.data?.find((p) => p.id === role.programId)?.name ??
                  `Program ${role.programId}`}
                : {role.value}
              </Text>
            ))
          ) : (
            <Text>Tidak ada hak akses</Text>
          )}
          <Link to="/admin-users">Kembali</Link>
        </>
      )}
    </RecordState>
  );
}
