import { Text } from '@mantine/core';
import { Link, useParams } from '@tanstack/react-router';
import { CrudPage } from '@web/components/crud/CrudPage';
import { DetailFields } from '@web/components/crud/DetailFields';
import { RecordState } from '@web/components/crud/RecordState';
import { useSession } from '@web/features/auth/hooks/useSession';
import {
  employeeDocumentKinds,
  employeeDocumentLabels,
  employeeOptionalFields,
  employeeProfileFields,
} from '@web/features/employees/employees.type';
import { useEmployeeDetail } from '@web/features/employees/hooks/useEmployeeDetail';
export function EmployeesViewPage() {
  return (
    <CrudPage program="CGP" action="read" title="Detail karyawan">
      <Content />
    </CrudPage>
  );
}
function Content() {
  const { id } = useParams({ from: '/employees/$id' });
  const { session } = useSession();
  const query = useEmployeeDetail(session?.authToken ?? '', Number(id));
  return (
    <RecordState id={Number(id)} query={query}>
      {(data) => (
        <>
          <DetailFields
            fields={[
              { label: 'Username', value: data.username },
              ...employeeProfileFields.map(([key, label]) => ({
                label,
                value: data.profile[key],
              })),
              ...employeeOptionalFields.map(([key, label]) => ({
                label,
                value: data.profile[key],
              })),
              {
                label: 'Pendapatan bersih bulanan',
                value: data.profile.takehomePay,
              },
            ]}
          />
          {employeeDocumentKinds.map((kind) => (
            <Text key={kind}>
              {employeeDocumentLabels[kind]}:{' '}
              {data.documents[kind] ? 'Tersimpan' : 'Belum diisi'}
            </Text>
          ))}
          <Link to="/employees">Kembali</Link>
        </>
      )}
    </RecordState>
  );
}
